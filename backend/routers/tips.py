from fastapi import APIRouter, Request
from pydantic import BaseModel
from limiter import limiter
from services import gemini_service
from routers.deps import validate_uuid_param

router = APIRouter(prefix="/tips", tags=["tips"])


class TipResponse(BaseModel):
    tip: str


@router.get("/")
@limiter.limit("10/minute")
async def get_tip(request: Request, user_id: str, force: bool = False):
    """
    GET /tips/?user_id=...&force=false

    Devuelve el consejo motivacional semanal del usuario.
    force=true omite el caché TTL y llama siempre a Gemini.
    Límite: 10 peticiones por minuto por IP para proteger la cuota de Gemini.
    """
    validate_uuid_param(user_id, "user_id")
    tip = await gemini_service.get_motivational_tip(user_id, force=force)
    return TipResponse(tip=tip)
