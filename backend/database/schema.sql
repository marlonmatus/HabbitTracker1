-- ============================================================
-- HabitTracker — Esquema PostgreSQL
-- Ejecutar en el SQL Editor de Supabase (o psql local)
-- ============================================================

-- ------------------------------------------------------------
-- USERS
-- Identidad del usuario dentro de la aplicación.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email        TEXT NOT NULL,
    display_name TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ------------------------------------------------------------
-- HABITS
-- Definición de cada hábito que el usuario quiere seguir.
-- is_active permite archivar sin borrar el historial.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- ------------------------------------------------------------
-- HABIT_LOGS
-- Un registro por cada día que el usuario completó un hábito.
-- La restricción UNIQUE impide duplicados sin lógica extra en backend.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habit_logs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id   UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    log_date   DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_habit_log_date UNIQUE (habit_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id      ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_log_date      ON habit_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date    ON habit_logs(habit_id, log_date);

-- ------------------------------------------------------------
-- WEEKLY_INSIGHTS
-- Caché persistente del consejo motivacional generado por Gemini.
-- Un registro por usuario por semana (lunes como inicio).
-- ON CONFLICT DO UPDATE permite upsert sin duplicados.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weekly_insights (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start   DATE NOT NULL,
    tip          TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Un solo consejo por usuario por semana
    CONSTRAINT uq_insight_user_week UNIQUE (user_id, week_start)
);

-- El UNIQUE constraint ya crea el índice; se documenta aquí para claridad.
-- CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_week ON weekly_insights(user_id, week_start);
