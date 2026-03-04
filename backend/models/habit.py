"""
models/habit.py
---------------
Esquemas Pydantic para la entidad Habit.

HabitCreate  → datos que el cliente ENVÍA al crear un hábito.
HabitResponse → datos que el servidor DEVUELVE (incluye id y created_at).

Separar Create/Response evita que el cliente pueda enviar un id arbitrario.
FastAPI valida automáticamente los campos antes de llamar al servicio.
"""

import uuid
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class HabitCreate(BaseModel):
    # El usuario al que pertenece este hábito
    user_id: str
    # Nombre del hábito, ej. "Leer 20 minutos"
    name: str
    # Descripción opcional del propósito del hábito
    description: Optional[str] = None

    @field_validator('user_id')
    @classmethod
    def validate_uuid(cls, v: str) -> str:
        try:
            uuid.UUID(v)
        except ValueError:
            raise ValueError('user_id debe ser un UUID válido')
        return v


class HabitResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime

class HabitDailyResponse(HabitResponse):
    done: bool
    streak: int = 0  # We can optionally compute this or just return 0 for now

