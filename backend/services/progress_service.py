from datetime import date, timedelta
from typing import Optional
from psycopg2.extensions import connection as PgConnection
from psycopg2.extras import RealDictCursor
from models.progress import WeeklyProgressResponse, ProgressInsightSummary


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


def get_weekly_progress_for_week(
    conn: PgConnection, user_id: str, week_start: date
) -> list[WeeklyProgressResponse]:
    """Igual que get_weekly_progress pero para una semana dada (week_start = lunes)."""
    week_end = week_start + timedelta(days=6)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT id, name FROM habits WHERE user_id = %s AND is_active = TRUE",
            (user_id,),
        )
        habits = cur.fetchall()
    if not habits:
        return []
    habit_ids = [h["id"] for h in habits]
    habit_map = {str(h["id"]): h["name"] for h in habits}
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
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
    days_by_habit: dict[str, set] = {str(h["id"]): set() for h in habits}
    for log in logs:
        days_by_habit[str(log["habit_id"])].add(log["log_date"])
    return [
        WeeklyProgressResponse(
            habit_id=hid,
            habit_name=habit_map[hid],
            days_completed=len(days),
            percentage=round((len(days) / 7) * 100, 1),
        )
        for hid, days in days_by_habit.items()
    ]


def get_insight_summary(conn: PgConnection, user_id: str) -> Optional[ProgressInsightSummary]:
    """
    Resumen para el insight de IA: porcentaje semanal, día más fuerte/débil,
    tendencia vs semana anterior, número de hábitos.
    Devuelve None si no hay hábitos.
    """
    week_start = get_week_start()
    current = get_weekly_progress_for_week(conn, user_id, week_start)
    if not current:
        return None
    num_habits = len(current)
    weekly_pct = round(sum(p.percentage for p in current) / num_habits, 1)

    # Día más fuerte/débil: contar completados por día de semana (0=lu, 6=do)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT id FROM habits WHERE user_id = %s AND is_active = TRUE",
            (user_id,),
        )
        rows = cur.fetchall()
    if not rows:
        return None
    habit_ids = [str(r["id"]) for r in rows]
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT log_date
            FROM habit_logs
            WHERE habit_id = ANY(%s::uuid[])
              AND log_date >= %s
              AND log_date <= %s
            """,
            (habit_ids, week_start, week_start + timedelta(days=6)),
        )
        log_dates = [r["log_date"] for r in cur.fetchall()]
    # (log_date - week_start).days -> 0..6 (lunes..domingo)
    day_counts = [0] * 7
    for d in log_dates:
        idx = (d - week_start).days
        if 0 <= idx <= 6:
            day_counts[idx] += 1
    strongest_day = int(day_counts.index(max(day_counts))) if day_counts else 0
    weakest_day = int(day_counts.index(min(day_counts))) if day_counts else 0

    # Tendencia vs semana anterior
    prev_start = week_start - timedelta(days=7)
    prev = get_weekly_progress_for_week(conn, user_id, prev_start)
    if not prev:
        trend_vs_previous = "same"
    else:
        prev_pct = sum(p.percentage for p in prev) / len(prev)
        if weekly_pct > prev_pct + 5:
            trend_vs_previous = "up"
        elif weekly_pct < prev_pct - 5:
            trend_vs_previous = "down"
        else:
            trend_vs_previous = "same"

    return ProgressInsightSummary(
        weekly_percentage=weekly_pct,
        strongest_day=strongest_day,
        weakest_day=weakest_day,
        trend_vs_previous=trend_vs_previous,
        num_habits=num_habits,
    )
