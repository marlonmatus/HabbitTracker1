from fastapi import APIRouter, Depends
from database import get_db
from models.habit import HabitCreate, HabitResponse, HabitDailyResponse
from services import habit_service
from routers.deps import validate_uuid_param
from datetime import date

router = APIRouter(prefix="/habits", tags=["habits"])

@router.get("/{user_id}/daily", response_model=list[HabitDailyResponse])
def get_daily_habits(user_id: str, date: date, db=Depends(get_db)):
    """
    GET /habits/{user_id}/daily?date=YYYY-MM-DD
    
    Devuelve los hábitos del usuario y si están completados en la fecha dada.
    """
    validate_uuid_param(user_id, "user_id")
    return habit_service.get_daily_habits(db, user_id, date)

@router.post("/", response_model=HabitResponse, status_code=201)
def create_habit(payload: HabitCreate, db=Depends(get_db)):
    """
    POST /habits/

    Crea un nuevo hábito para un usuario.
    El cliente envía: { "user_id": "...", "name": "...", "description": "..." }
    El servidor devuelve el hábito creado con su id y created_at.

    Depends(get_db) inyecta automáticamente la conexión a la BD.
    Al terminar este endpoint, get_db() hace commit si todo salió bien.
    """
    return habit_service.create_habit(db, payload)


@router.get("/{user_id}", response_model=list[HabitResponse])
def list_habits(user_id: str, db=Depends(get_db)):
    """
    GET /habits/{user_id}

    Devuelve todos los hábitos activos de un usuario.
    El {user_id} se extrae automáticamente de la URL.
    Si el usuario no tiene hábitos, devuelve una lista vacía [].
    """
    validate_uuid_param(user_id, "user_id")
    return habit_service.get_habits_by_user(db, user_id)


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: str, user_id: str, db=Depends(get_db)):
    """
    DELETE /habits/{habit_id}?user_id=...

    Elimina un hábito. El user_id se pasa como query param para verificar
    que el hábito pertenece al usuario que hace la petición.
    Devuelve 204 (sin cuerpo) si se eliminó correctamente, 404 si no existe.
    """
    validate_uuid_param(habit_id, "habit_id")
    validate_uuid_param(user_id, "user_id")
    habit_service.delete_habit(db, habit_id, user_id)
