"""
routers/ai.py
-------------
Endpoints de IA (Gemini): insight de progreso, mensajes contextuales,
recomendador de hábitos y chat coach zen.
"""

from typing import Optional, List, Dict
from datetime import date
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from limiter import limiter
from database import get_db
from routers.deps import validate_uuid_param
from services import gemini_service
from services.progress_service import get_insight_summary
from services.habit_service import get_streak
from psycopg2.extras import RealDictCursor

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/ping")
def ping():
    return {"status": "pong"}


class ContextualEventBody(BaseModel):
    user_id: str
    habit_id: Optional[str] = None
    just_completed: Optional[bool] = None
    trigger: Optional[str] = None  # "toggle" | "dashboard"


class CoachBody(BaseModel):
    user_id: str
    message: str
    history: Optional[List[Dict]] = None


class ConsejoStartBody(BaseModel):
    user_id: str


class ConsejoAnswerBody(BaseModel):
    session_id: str
    answer: str


# --- Consejo personalizado (preguntas una por una, luego consejo formateado)
@router.post("/consejo/start")
@limiter.limit("5/minute")
async def consejo_start(request: Request, body: ConsejoStartBody):
    """POST /ai/consejo/start — Inicia flujo de preguntas para consejo personalizado."""
    validate_uuid_param(body.user_id, "user_id")
    session_id, question = await gemini_service.start_consejo_flow(body.user_id)
    return {"session_id": session_id, "question": question}


@router.post("/consejo/answer")
@limiter.limit("15/minute")
async def consejo_answer(request: Request, body: ConsejoAnswerBody):
    """POST /ai/consejo/answer — Envía respuesta; devuelve siguiente pregunta o consejo final."""
    session_id = (body.session_id or "").strip()
    if not session_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="session_id requerido")
    try:
        result = await gemini_service.submit_consejo_answer(session_id, body.answer or "")
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    return result


# --- Insight (también accesible como GET /insight para claridad)
@router.get("/insight")
@limiter.limit("10/minute")
async def get_insight(request: Request, user_id: str):
    """GET /ai/insight?user_id=... — Insight inteligente del progreso (3.1)."""
    validate_uuid_param(user_id, "user_id")
    insight = await gemini_service.get_progress_insight(user_id)
    return {"insight": insight}


@router.post("/contextual-event")
@limiter.limit("15/minute")
async def contextual_event(request: Request, body: ContextualEventBody, db=Depends(get_db)):
    """
    POST /ai/contextual-event — Detecta evento (racha rota, nueva racha, racha 7, mejora, caída)
    y devuelve mensaje para toast/modal (3.2).
    """
    validate_uuid_param(body.user_id, "user_id")
    event_type = None
    context = {}

    # Eventos por racha (toggle)
    if body.habit_id and body.just_completed is not None:
        validate_uuid_param(body.habit_id, "habit_id")
        streak = get_streak(db, body.habit_id, date.today())
        with db.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT name FROM habits WHERE id = %s", (body.habit_id,))
            row = cur.fetchone()
        habit_name = row["name"] if row else "Hábito"
        context["habit_name"] = habit_name
        context["streak"] = streak
        if body.just_completed:
            if streak == 1:
                event_type = "nueva_racha"
            elif streak == 7:
                event_type = "racha_7"
        else:
            if streak == 0:
                with db.cursor() as cur:
                    cur.execute(
                        "SELECT 1 FROM habit_logs WHERE habit_id = %s LIMIT 1",
                        (body.habit_id,),
                    )
                    if cur.fetchone():
                        event_type = "racha_rota"

    # Eventos por tendencia (dashboard o si no hubo evento de racha)
    if event_type is None and body.trigger == "dashboard":
        summary = get_insight_summary(db, body.user_id)
        if summary and summary.trend_vs_previous == "up":
            event_type = "mejora_significativa"
            context["trend"] = "up"
        elif summary and summary.trend_vs_previous == "down":
            event_type = "caida_significativa"
            context["trend"] = "down"

    if event_type is None:
        return {}
    message = await gemini_service.get_contextual_message(event_type, context)
    return {"event_type": event_type, "message": message}


@router.get("/suggest-habit")
@limiter.limit("5/minute")
async def suggest_habit(request: Request, user_id: str):
    """GET /ai/suggest-habit?user_id=... — Recomendador inteligente de hábito (3.3)."""
    validate_uuid_param(user_id, "user_id")
    data = await gemini_service.get_habit_suggestion(user_id)
    return data


@router.post("/coach")
@limiter.limit("10/minute")
async def coach(request: Request, body: CoachBody):
    """POST /ai/coach — Chat coach zen (3.4)."""
    validate_uuid_param(body.user_id, "user_id")
    reply = await gemini_service.chat_coach(body.user_id, body.message, body.history)
    return {"reply": reply}
