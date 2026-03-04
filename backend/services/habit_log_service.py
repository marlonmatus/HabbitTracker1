"""
services/habit_log_service.py
------------------------------
Lógica de negocio para registrar el cumplimiento diario de un hábito.

Regla de negocio principal:
  Un hábito solo puede marcarse como completado UNA VEZ por día.
  Esto se garantiza a dos niveles:
    1. Restricción UNIQUE (habit_id, log_date) en la base de datos.
    2. Este servicio captura la excepción y la convierte en HTTP 409 (Conflict).

Capturar el error en la capa de servicio (no en el router) mantiene los
routers limpios y enfocados solo en la entrada/salida HTTP.
"""

from fastapi import HTTPException
import psycopg2.errors
from psycopg2.extensions import connection as PgConnection
from psycopg2.extras import RealDictCursor
from models.habit_log import HabitLogCreate, HabitLogResponse
from datetime import date


def create_log(conn: PgConnection, payload: HabitLogCreate) -> HabitLogResponse:
    """
    Registra que un hábito fue completado en una fecha específica.

    Si el hábito ya fue registrado ese día, PostgreSQL lanza UniqueViolation.
    Lo capturamos y respondemos con 409 en lugar de un error 500 genérico,
    para que el cliente (app/frontend) pueda mostrar un mensaje claro al usuario.
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO habit_logs (habit_id, log_date)
                VALUES (%s, %s)
                RETURNING *
                """,
                (payload.habit_id, payload.log_date),
            )
            row = cur.fetchone()
            return HabitLogResponse(**row)

    except psycopg2.errors.UniqueViolation:
        # El hábito ya fue completado hoy; informamos al cliente de forma legible
        raise HTTPException(
            status_code=409,
            detail="Este hábito ya fue marcado como completado en esta fecha.",
        )


def delete_log(conn: PgConnection, habit_id: str, log_date: date) -> None:
    """
    Elimina el registro de un hábito en una fecha concreta.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            DELETE FROM habit_logs
            WHERE habit_id = %s AND log_date = %s
            """,
            (habit_id, log_date),
        )


def get_logs_by_habit(
    conn: PgConnection,
    habit_id: str,
    limit: int = 90,
    offset: int = 0,
) -> list[HabitLogResponse]:
    """
    Devuelve el historial de cumplimiento de un hábito.

    ORDER BY log_date DESC → las fechas más recientes primero.
    LIMIT 90 por defecto: evita transferir cientos de filas innecesariamente.
    El frontend puede pedir páginas adicionales con el parámetro `offset`.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT * FROM habit_logs
            WHERE habit_id = %s
            ORDER BY log_date DESC
            LIMIT %s OFFSET %s
            """,
            (habit_id, limit, offset),
        )
        rows = cur.fetchall()
        return [HabitLogResponse(**row) for row in rows]
