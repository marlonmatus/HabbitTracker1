"""
limiter.py
----------
Singleton del rate limiter de slowapi.

Se crea aquí (no en main.py) para que los routers puedan importarlo
sin crear dependencias circulares con la aplicación FastAPI.

Configuración:
  - default_limits=["30/minute"] aplica 30 req/min a TODOS los endpoints.
  - Los routers individuales pueden sobreescribir con @limiter.limit("N/minute").
  - La clave de identificación es la IP del cliente.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["30/minute"],
)
