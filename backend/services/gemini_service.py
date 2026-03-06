"""
services/gemini_service.py
--------------------------
Gestión del consejo motivacional semanal con Gemini.

  - get_motivational_tip gestiona sus propias conexiones desde el pool para
    minimizar el tiempo de retención: obtiene conexión → ejecuta SQL → libera
    conexión → llama a Gemini → obtiene conexión → guarda → libera. Así ninguna
    conexión queda bloqueada durante los 2-5 s que tarda la API de Gemini.

  - Estrategia TTL: el tip se regenera solo si tiene más de TIP_TTL_HOURS horas
    de antigüedad (por defecto 24h). force=True omite esta comprobación.
"""

import logging
import os
from contextlib import contextmanager
from datetime import datetime, timezone, timedelta
from typing import Optional

from dotenv import load_dotenv
import google.generativeai as genai
from psycopg2.extras import RealDictCursor

from database import get_connection, release_connection
from services.progress_service import get_weekly_progress, get_week_start, get_insight_summary
from services.habit_service import get_streak

load_dotenv()

logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

_GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
_TIP_TTL_HOURS: int = int(os.getenv("TIP_TTL_HOURS", "24"))

# Reglas comunes para respuestas IA (plan 3.x). Consejos con formato: ## secciones, ** ideas clave, emojis.
_ZEN_RULES = (
    "Responde en español neutro. Tono de coach zen suave. "
    "Usa ## para títulos de sección, ** para ideas importantes y emojis que mejoren la lectura (bienestar, energía, calma). "
    "Sin clichés. Sin afirmaciones médicas. "
)


@contextmanager
def _get_conn():
    """Context manager que obtiene y libera una conexión del pool de forma segura."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        release_connection(conn)


def _get_cached_tip(conn, user_id: str, week_start: str):
    """
    Devuelve (tip, generated_at) si existe un tip guardado para esa semana,
    o (None, None) si no existe.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT tip, generated_at FROM weekly_insights WHERE user_id = %s AND week_start = %s",
            (user_id, week_start),
        )
        row = cur.fetchone()
        if not row:
            return None, None
        return row["tip"], row["generated_at"]


def _save_tip(conn, user_id: str, week_start: str, tip: str) -> None:
    """
    Upsert del consejo: inserta o actualiza si ya existe el par (user_id, week_start).
    Actualiza generated_at para reiniciar el TTL.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO weekly_insights (user_id, week_start, tip)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, week_start)
            DO UPDATE SET tip = EXCLUDED.tip, generated_at = NOW()
            """,
            (user_id, week_start, tip),
        )


def _is_stale(generated_at: datetime) -> bool:
    """Devuelve True si el tip supera el TTL configurado."""
    if generated_at is None:
        return True
    # psycopg2 devuelve datetime con tzinfo si la columna es TIMESTAMPTZ.
    # Normalizamos a UTC para comparar de forma segura.
    if generated_at.tzinfo is None:
        generated_at = generated_at.replace(tzinfo=timezone.utc)
    age = datetime.now(timezone.utc) - generated_at
    return age >= timedelta(hours=_TIP_TTL_HOURS)


async def get_motivational_tip(user_id: str, force: bool = False) -> str:
    """
    Devuelve el consejo motivacional para el usuario de la semana actual.

    force=True omite el chequeo de caché TTL y llama siempre a Gemini,
    útil cuando el usuario pulsa el botón "Nuevo consejo" manualmente.

    Flujo:
      Fase 1 (SQL, conexión corta):
        - Si force=False: consulta caché; si es fresco lo devuelve sin llamar a Gemini.
        - Si force=True:  omite caché y lee el progreso semanal directamente.
        - Libera la conexión ANTES de llamar a Gemini.

      Fase 2 (Gemini, sin conexión):
        - Construye el prompt con el resumen de progreso.
        - Llama a la API. Si falla, registra el error y usa un consejo de fallback.

      Fase 3 (SQL, conexión corta):
        - Guarda el nuevo tip en weekly_insights.
        - Libera la conexión.
    """
    week_start = str(get_week_start())

    # ── Fase 1: leer caché y progreso ────────────────────────────────────────
    with _get_conn() as conn:
        if not force:
            cached_tip, generated_at = _get_cached_tip(conn, user_id, week_start)
            if cached_tip and not _is_stale(generated_at):
                return cached_tip

        progress = get_weekly_progress(conn, user_id)

    # ── Fase 2: generar tip con Gemini (sin conexión abierta) ────────────────
    if not progress:
        tip = "¡Crea tu primer hábito y comienza tu camino hacia una mejor versión de ti mismo!"
    else:
        summary_lines = [
            f"- {item.habit_name}: {item.days_completed}/7 días completados ({item.percentage}%)"
            for item in progress
        ]
        prompt = (
            _ZEN_RULES
            + "Eres un coach de hábitos motivacional. Basándote en el progreso semanal del usuario, genera un consejo breve. "
            "Formato: usa ## para cada sección (ej: ## Esta semana), ** para ideas clave y emojis. Máximo 4 secciones y 150 palabras.\n\n"
            f"Progreso de esta semana:\n" + "\n".join(summary_lines)
        )

        try:
            model = genai.GenerativeModel(_GEMINI_MODEL)
            response = await model.generate_content_async(prompt)
            tip = response.text.strip()
            if not tip:
                raise ValueError("Gemini devolvió una respuesta vacía.")
        except Exception as exc:
            logger.error("Gemini API failed for user %s: %s", user_id, exc)
            tip = (
                "Cada día que completas un hábito es un paso hacia la mejor versión de ti mismo. "
                "¡Sigue adelante!"
            )

    # ── Fase 3: guardar el tip ───────────────────────────────────────────────
    with _get_conn() as conn:
        _save_tip(conn, user_id, week_start, tip)

    return tip


async def get_progress_insight(user_id: str) -> str:
    """
    Insight inteligente del progreso: observación basada en datos,
    interpretación reflexiva y recomendación concreta. Se genera al abrir Dashboard.
    """
    with _get_conn() as conn:
        summary = get_insight_summary(conn, user_id)
    if not summary:
        return "Aún no hay suficientes datos. Cuando completes hábitos esta semana, podrás ver aquí un insight personalizado."
    day_names = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    strongest = day_names[summary.strongest_day] if 0 <= summary.strongest_day < 7 else "—"
    weakest = day_names[summary.weakest_day] if 0 <= summary.weakest_day < 7 else "—"
    trend = {"up": "subiendo respecto a la semana anterior", "down": "bajando respecto a la semana anterior", "same": "estable respecto a la semana anterior"}.get(summary.trend_vs_previous, "estable")
    prompt = (
        _ZEN_RULES
        + "\n\nEres un coach de hábitos. Con estos datos escribe un insight muy breve y puntual. "
        "Una sola observación clara, una idea clave y una recomendación concreta en 1–2 líneas. "
        "Formato: ## para secciones (máximo 2–3), ** para lo importante, emojis sutiles. "
        "Máximo 50–65 palabras. Sin relleno: cada frase debe aportar.\n\n"
        f"Datos: porcentaje semanal {summary.weekly_percentage}%, "
        f"día más fuerte {strongest}, más débil {weakest}, tendencia {trend}, "
        f"número de hábitos {summary.num_habits}."
    )
    try:
        model = genai.GenerativeModel(_GEMINI_MODEL)
        response = await model.generate_content_async(prompt)
        return response.text.strip() or "Tu progreso va tomando forma. Sigue con un pequeño paso a la vez."
    except Exception as exc:
        logger.error("Gemini progress insight failed for user %s: %s", user_id, exc)
        return "Tu progreso va tomando forma. Sigue con un pequeño paso a la vez."


async def get_contextual_message(event_type: str, context: dict) -> str:
    """
    Mensaje contextual por evento (racha rota, nueva racha, racha 7, mejora, caída).
    Objetivo: validar emoción y ofrecer un micro-paso.
    """
    event_descriptions = {
        "racha_rota": "El usuario acaba de romper una racha en un hábito.",
        "nueva_racha": "El usuario acaba de empezar una nueva racha (primer día).",
        "racha_7": "El usuario acaba de cumplir 7 días seguidos en un hábito.",
        "mejora_significativa": "El usuario ha mejorado de forma significativa respecto a la semana anterior.",
        "caida_significativa": "El usuario ha tenido una caída significativa respecto a la semana anterior.",
    }
    desc = event_descriptions.get(event_type, "Evento de progreso.")
    ctx_str = " ".join(f"{k}: {v}" for k, v in context.items())
    prompt = (
        _ZEN_RULES
        + f"\n\n{desc} Contexto: {ctx_str}. "
        "Escribe un mensaje muy breve que valide la emoción del usuario y sugiera un solo micro-paso. Sin emojis."
    )
    try:
        model = genai.GenerativeModel(_GEMINI_MODEL)
        response = await model.generate_content_async(prompt)
        return response.text.strip() or "Cada día es una nueva oportunidad."
    except Exception as exc:
        logger.error("Gemini contextual message failed: %s", exc)
        return "Cada día es una nueva oportunidad."


async def get_habit_suggestion(user_id: str) -> dict:
    """
    Recomendador inteligente de hábito. Devuelve name, frequency, reason, first_step.
    """
    with _get_conn() as conn:
        progress = get_weekly_progress(conn, user_id)
    if not progress:
        consistency = "sin hábitos aún"
        habits_text = "Ninguno"
    else:
        avg_pct = sum(p.percentage for p in progress) / len(progress)
        consistency = f"consistencia media {round(avg_pct)}%"
        habits_text = ", ".join(p.habit_name for p in progress)
    prompt = (
        _ZEN_RULES
        + f"\n\nEl usuario tiene estos hábitos: {habits_text}. {consistency}. "
        "Sugiere UN solo hábito nuevo que encaje (nombre corto), su frecuencia (ej. diario, 3 veces por semana), "
        "una razón breve y un primer paso concreto. Responde SOLO con un JSON válido con las claves: name, frequency, reason, first_step. Sin otro texto."
    )
    try:
        model = genai.GenerativeModel(_GEMINI_MODEL)
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        # Extraer JSON si viene envuelto en markdown
        if "```" in text:
            start = text.find("{")
            end = text.rfind("}") + 1
            if start >= 0 and end > start:
                text = text[start:end]
        import json
        data = json.loads(text)
        return {
            "name": data.get("name", "Nuevo hábito"),
            "frequency": data.get("frequency", "diario"),
            "reason": data.get("reason", ""),
            "first_step": data.get("first_step", ""),
        }
    except Exception as exc:
        logger.error("Gemini habit suggestion failed for user %s: %s", user_id, exc)
        return {
            "name": "Caminar 10 minutos",
            "frequency": "diario",
            "reason": "Movimiento suave que ayuda a mantener energía.",
            "first_step": "Sal hoy a dar una vuelta breve.",
        }


# ─── Flujo de consejo personalizado (preguntas una por una) ─────────────────────

CONSEJO_QUESTIONS = [
    "¿Cómo te sientes con tu nivel de energía últimamente?",
    "¿Qué hábito te cuesta más mantener y por qué crees que es?",
    "¿En qué momento del día sueles tener más fuerza de voluntad?",
    "¿Hay algo que te esté generando estrés o que quieras mejorar esta semana?",
    "¿Qué te gustaría lograr con tus hábitos en el próximo mes?",
]

_consejo_sessions: dict = {}  # session_id -> { "user_id": str, "answers": list[str], "step": int }


def _new_session_id() -> str:
    import uuid
    return str(uuid.uuid4())


async def start_consejo_flow(user_id: str) -> tuple[str, str]:
    """
    Inicia el flujo de consejo personalizado. Devuelve (session_id, primera_pregunta).
    """
    session_id = _new_session_id()
    _consejo_sessions[session_id] = {"user_id": user_id, "answers": [], "step": 0}
    return session_id, CONSEJO_QUESTIONS[0]


async def submit_consejo_answer(session_id: str, answer: str) -> dict:
    """
    Envía la respuesta del usuario. Devuelve:
    - {"question": "siguiente pregunta"} si quedan más preguntas.
    - {"done": True, "consejo": "..."} si ya no hay más preguntas. El consejo viene
      formateado con ## para secciones, ** para ideas importantes y emojis.
    """
    session = _consejo_sessions.get(session_id)
    if not session:
        raise ValueError("Sesión no encontrada o expirada.")
    answer_clean = (answer or "").strip()
    if not answer_clean:
        raise ValueError("La respuesta no puede estar vacía.")
    session["answers"].append(answer_clean)
    session["step"] += 1
    next_idx = session["step"]
    if next_idx < len(CONSEJO_QUESTIONS):
        return {"question": CONSEJO_QUESTIONS[next_idx]}
    # Generar consejo con Gemini: formateado con secciones, negritas y emojis
    consejo = await _generate_formatted_consejo(session["user_id"], session["answers"])
    del _consejo_sessions[session_id]
    return {"done": True, "consejo": consejo}


async def _generate_formatted_consejo(user_id: str, answers: list[str]) -> str:
    """Genera el consejo personalizado con formato: ## secciones, ** ideas clave, emojis."""
    answers_text = "\n".join(f"- {a}" for a in answers)
    prompt = (
        "Eres un coach de bienestar zen. Con las siguientes respuestas del usuario, escribe un consejo personalizado.\n\n"
        "REQUISITOS DE FORMATO (obligatorios):\n"
        "1. Usa ## para cada título de sección (ej: ## Energía).\n"
        "2. Usa ** para resaltar ideas importantes (ej: **descansar bien**).\n"
        "3. Incluye emojis que mejoren la lectura (bienestar, energía, calma, logros).\n"
        "4. Máximo 4 secciones y 200 palabras. Tono calmado y en español.\n\n"
        "Respuestas del usuario:\n" + answers_text
    )
    try:
        model = genai.GenerativeModel(_GEMINI_MODEL)
        response = await model.generate_content_async(prompt)
        text = (response.text or "").strip()
        if not text:
            return _fallback_formatted_consejo()
        return text
    except Exception as exc:
        logger.error("Gemini formatted consejo failed for user %s: %s", user_id, exc)
        return _fallback_formatted_consejo()


def _fallback_formatted_consejo() -> str:
    return (
        "## Tu momento\n\n"
        "**Cada pequeño paso cuenta.** 🌱\n\n"
        "## Siguiente paso\n\n"
        "Elige una sola acción hoy y hazla con calma. ✨"
    )


async def chat_coach(user_id: str, message: str, history: Optional[list] = None) -> str:
    """
    Chat coach zen: respuesta empática, breve, sin presión, sin consejos médicos.
    history: lista de {role, content} para contexto (opcional).
    La respuesta usa ** para negritas y saltos de línea para párrafos (se muestra formateada en la UI).
    """
    system = (
        _ZEN_RULES
        + " Eres un coach zen. Responde con empatía, de forma breve y calmada. "
        "No presiones. No des consejos médicos. La experiencia debe ser calmada, no técnica. "
        "Formato: usa ** para resaltar ideas importantes y separa párrafos con saltos de línea. Puedes usar emojis con moderación."
    )
    parts = [system + "\n\nEl usuario escribe: " + message]
    if history:
        for h in history[-6:]:  # últimas 3 rondas
            parts.append(f"{h.get('role', 'user')}: {h.get('content', '')}")
    try:
        model = genai.GenerativeModel(_GEMINI_MODEL)
        response = await model.generate_content_async("\n".join(parts))
        text = (response.text or "").strip()
        if not text:
            return "Estoy aquí cuando me necesites."
        return text
    except Exception as exc:
        logger.error("Gemini chat coach failed for user %s: %s", user_id, exc)
        return "Estoy aquí cuando me necesites."
