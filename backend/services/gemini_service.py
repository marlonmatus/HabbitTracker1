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

from dotenv import load_dotenv
import google.generativeai as genai
from psycopg2.extras import RealDictCursor

from database import get_connection, release_connection
from services.progress_service import get_weekly_progress, get_week_start

load_dotenv()

logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

_GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
_TIP_TTL_HOURS: int = int(os.getenv("TIP_TTL_HOURS", "24"))


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


def get_motivational_tip(user_id: str, force: bool = False) -> str:
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
            "Eres un coach de hábitos motivacional. "
            "Basándote en el progreso semanal del usuario, genera un consejo corto, "
            "positivo y personalizado en español (máximo 3 oraciones). "
            "No repitas los datos, solo da el consejo.\n\n"
            f"Progreso de esta semana:\n" + "\n".join(summary_lines)
        )

        try:
            model = genai.GenerativeModel(_GEMINI_MODEL)
            response = model.generate_content(prompt)
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
