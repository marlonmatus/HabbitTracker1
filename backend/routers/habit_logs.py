from fastapi import APIRouter, Depends
from database import get_db
from models.habit_log import HabitLogCreate, HabitLogResponse
from services import habit_log_service
from routers.deps import validate_uuid_param

router = APIRouter(prefix="/habit-logs", tags=["habit-logs"])


@router.post("/", response_model=HabitLogResponse, status_code=201)
def log_habit(payload: HabitLogCreate, db=Depends(get_db)):
    """
    POST /habit-logs/

    Marca un hábito como completado en una fecha concreta.
    El cliente envía: { "habit_id": "...", "log_date": "2026-03-04" }

    Si el hábito ya fue registrado ese día, el servicio devuelve HTTP 409.
    """
    return habit_log_service.create_log(db, payload)


@router.delete("/", status_code=204)
def remove_habit_log(payload: HabitLogCreate, db=Depends(get_db)):
    """
    DELETE /habit-logs/

    Desmarca un hábito previamente completado en una fecha concreta.
    """
    habit_log_service.delete_log(db, payload.habit_id, payload.log_date)
    return None


@router.delete("/", status_code=204)
def remove_habit_log(payload: HabitLogCreate, db=Depends(get_db)):
    """
    DELETE /habit-logs/

    Desmarca un hábito previamente completado en una fecha concreta.
    """
    habit_log_service.delete_log(db, payload.habit_id, payload.log_date)
    return None


@router.get("/{habit_id}", response_model=list[HabitLogResponse])
def list_logs(
    habit_id: str,
    limit: int = 90,
    offset: int = 0,
    db=Depends(get_db),
):
    """
    GET /habit-logs/{habit_id}?limit=90&offset=0

    Devuelve el historial de cumplimiento de un hábito específico,
    ordenado de más reciente a más antiguo.
    Por defecto devuelve los últimos 90 registros. Usar `offset` para paginar.
    """
    validate_uuid_param(habit_id, "habit_id")
    return habit_log_service.get_logs_by_habit(db, habit_id, limit=limit, offset=offset)
