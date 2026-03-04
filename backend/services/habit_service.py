"""
services/habit_service.py
-------------------------
Lógica de negocio para la gestión de hábitos.

Cada función recibe `conn` (una conexión PostgreSQL activa inyectada por
FastAPI) y ejecuta SQL directamente. No abre ni cierra conexiones propias;
eso lo controla el generador get_db() en database/__init__.py.

Flujo típico:
  Router → service(conn, payload) → SQL sobre conn → devuelve modelo Pydantic
"""

from fastapi import HTTPException
from psycopg2.extensions import connection as PgConnection
from psycopg2.extras import RealDictCursor
from models.habit import HabitCreate, HabitResponse, HabitDailyResponse
from datetime import date


def create_habit(conn: PgConnection, payload: HabitCreate) -> HabitResponse:
    """
    Inserta un nuevo hábito en la tabla `habits`.

    RETURNING * le pide a PostgreSQL que devuelva la fila recién insertada,
    así evitamos hacer un segundo SELECT para obtener el id y created_at
    generados por la base de datos.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO habits (user_id, name, description)
            VALUES (%s, %s, %s)
            RETURNING *
            """,
            (payload.user_id, payload.name, payload.description),
        )
        row = cur.fetchone()

        # Si por alguna razón no se devolvió ninguna fila, es un error interno
        if not row:
            raise HTTPException(status_code=500, detail="Error al crear el hábito.")

        # Convertimos el dict de la BD en el modelo Pydantic que FastAPI serializará
        return HabitResponse(**row)


def get_habits_by_user(conn: PgConnection, user_id: str) -> list[HabitResponse]:
    """
    Devuelve todos los hábitos de un usuario, ordenados por fecha de creación.

    ORDER BY created_at garantiza que los hábitos más antiguos aparezcan
    primero, dando un orden estable y predecible en el frontend.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM habits WHERE user_id = %s ORDER BY created_at",
            (user_id,),
        )
        rows = cur.fetchall()

        # Si el usuario no tiene hábitos aún, devolvemos lista vacía (no un error)
        return [HabitResponse(**row) for row in rows]


def get_daily_habits(conn: PgConnection, user_id: str, target_date: date) -> list[HabitDailyResponse]:
    """
    Devuelve todos los hábitos de un usuario con un booleano indicando si
    fueron completados en la fecha `target_date`.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT h.*, 
                   EXISTS(
                       SELECT 1 FROM habit_logs hl 
                       WHERE hl.habit_id = h.id AND hl.log_date = %s
                   ) as done
            FROM habits h
            WHERE h.user_id = %s AND h.is_active = TRUE
            ORDER BY h.created_at
            """,
            (target_date, user_id),
        )
        rows = cur.fetchall()

        # Calculamos streak como 0 por ahora para simplificar, se puede implementar después.
        result = []
        for row in rows:
            row_dict = dict(row)
            row_dict['streak'] = 0
            result.append(HabitDailyResponse(**row_dict))
            
        return result


def delete_habit(conn: PgConnection, habit_id: str, user_id: str) -> None:
    """
    Elimina un hábito solo si pertenece al usuario que hace la petición.

    La condición `AND user_id = %s` evita que un usuario borre hábitos ajenos.
    Si RETURNING id no devuelve nada, el hábito no existía o no pertenece
    a ese usuario: respondemos 404 en ambos casos para no revelar información.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "DELETE FROM habits WHERE id = %s AND user_id = %s RETURNING id",
            (habit_id, user_id),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Hábito no encontrado.")
