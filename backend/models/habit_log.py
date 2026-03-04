"""
models/habit_log.py
-------------------
Esquemas Pydantic para registrar el cumplimiento diario de un hábito.

HabitLogCreate  → datos que el cliente envía para marcar un hábito como completado.
HabitLogResponse → datos que el servidor devuelve tras registrar el cumplimiento.

El campo log_date es de tipo `date` (solo fecha, sin hora).
Si el cliente envía una cadena inválida, FastAPI retorna 422 automáticamente.
"""

import uuid
from pydantic import BaseModel, field_validator
from datetime import date, datetime


class HabitLogCreate(BaseModel):
    # ID del hábito que se completó
    habit_id: str
    # Fecha en que se completó (formato YYYY-MM-DD, ej. "2026-03-04")
    log_date: date

    @field_validator('habit_id')
    @classmethod
    def validate_uuid(cls, v: str) -> str:
        try:
            uuid.UUID(v)
        except ValueError:
            raise ValueError('habit_id debe ser un UUID válido')
        return v


class HabitLogResponse(BaseModel):
    id: str
    habit_id: str
    log_date: date
    # Cuándo se insertó el registro (puede diferir de log_date si se registra con retraso)
    created_at: datetime
