from datetime import date, timedelta
from psycopg2.extensions import connection as PgConnection
from psycopg2.extras import RealDictCursor
from models.progress import WeeklyProgressResponse


def get_week_start() -> date:
    """Devuelve el lunes de la semana actual."""
    today = date.today()
    return today - timedelta(days=today.weekday())


def get_weekly_progress(conn: PgConnection, user_id: str) -> list[WeeklyProgressResponse]:
    """
    Calcula cuántos días de la semana actual completó el usuario cada hábito.

    Ventana temporal: lunes 00:00 → domingo 23:59 de la semana en curso.
    Incluir un límite SUPERIOR (week_end) evita que logs con fechas futuras
    contaminen el porcentaje de la semana actual y que el porcentaje supere 100 %.
    """
    week_start = get_week_start()
    week_end = week_start + timedelta(days=6)  # domingo de la misma semana

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT id, name FROM habits WHERE user_id = %s AND is_active = TRUE",
            (user_id,),
        )
        habits = cur.fetchall()

        if not habits:
            return []

        habit_ids = [h["id"] for h in habits]

        # Bug fix: las claves deben ser str para que coincidan con days_by_habit
        # psycopg2 devuelve h["id"] como uuid.UUID; str(uuid) != uuid en lookups de dict
        habit_map = {str(h["id"]): h["name"] for h in habits}

        # Bug fix: límite superior AND log_date <= week_end para excluir fechas futuras
        # Bug fix: cast explícito ::uuid[] necesario porque el Session Pooler de Supabase
        # retorna los IDs como str Python → psycopg2 los envía como text[] → incompatible
        # con columnas uuid sin cast explícito.
        cur.execute(
            """
            SELECT habit_id, log_date
            FROM habit_logs
            WHERE habit_id = ANY(%s::uuid[])
              AND log_date >= %s
              AND log_date <= %s
            """,
            ([str(x) for x in habit_ids], week_start, week_end),
        )
        logs = cur.fetchall()

    # Agrupamos los logs por hábito usando un set de fechas (evita contar duplicados)
    days_by_habit: dict[str, set] = {str(h["id"]): set() for h in habits}
    for log in logs:
        days_by_habit[str(log["habit_id"])].add(log["log_date"])

    progress = []
    for habit_id, days in days_by_habit.items():
        days_completed = len(days)
        percentage = round((days_completed / 7) * 100, 1)
        progress.append(
            WeeklyProgressResponse(
                habit_id=habit_id,
                habit_name=habit_map[habit_id],  # ahora str → str, sin KeyError
                days_completed=days_completed,
                percentage=percentage,
            )
        )

    return progress
