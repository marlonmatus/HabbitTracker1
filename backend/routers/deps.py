"""
routers/deps.py
---------------
Dependencias FastAPI reutilizables entre routers.

validate_uuid_param valida que un string sea un UUID v4 válido antes de
que el endpoint lo pase a la base de datos. Esto convierte un potencial
error 500 (InvalidTextRepresentation de PostgreSQL) en un 400 claro.
"""

import uuid
from fastapi import HTTPException


def validate_uuid_param(value: str, param_name: str = "id") -> str:
    """Lanza HTTP 400 si value no es un UUID válido."""
    try:
        uuid.UUID(value)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"'{param_name}' debe ser un UUID válido.",
        )
    return value
