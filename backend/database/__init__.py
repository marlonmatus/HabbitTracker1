"""
database/__init__.py
--------------------
Punto único de conexión a PostgreSQL.

Al importarse este módulo (lo hace main.py al arrancar), se:
  1. Carga el archivo .env con python-dotenv.
  2. Lee la variable DATABASE_URL.
  3. Crea un pool de conexiones reutilizables.

Tamaño del pool controlado por variables de entorno:
  DB_POOL_MIN  — conexiones mínimas siempre abiertas (default: 1)
  DB_POOL_MAX  — conexiones máximas simultáneas     (default: 10)

Ningún otro módulo abre conexiones directamente. Todos usan get_db()
o get_connection()/release_connection() para gestión manual.
"""

import os
from typing import Generator

import psycopg2
from psycopg2.pool import ThreadedConnectionPool
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Carga las variables del archivo .env antes de leerlas
load_dotenv()

DATABASE_URL: str = os.getenv("DATABASE_URL", "")

# Si la variable no existe, el servidor falla al arrancar (fail-fast).
# Así evitamos errores silenciosos durante las peticiones.
if not DATABASE_URL:
    raise EnvironmentError(
        "DATABASE_URL must be set in environment variables. "
        "Example: postgresql://postgres:postgres@localhost:54322/postgres"
    )

# Tamaño del pool leído desde .env para que pueda ajustarse sin redeploy.
_pool: ThreadedConnectionPool = ThreadedConnectionPool(
    minconn=int(os.getenv("DB_POOL_MIN", "1")),
    maxconn=int(os.getenv("DB_POOL_MAX", "10")),
    dsn=DATABASE_URL,
)


def get_connection():
    """
    Obtiene una conexión del pool para gestión manual.
    El llamador es responsable de llamar a release_connection() cuando termine.
    Usar preferentemente en servicios que necesitan liberar la conexión
    antes de operaciones lentas (ej.: llamadas a APIs externas).
    """
    return _pool.getconn()


def release_connection(conn) -> None:
    """Devuelve una conexión al pool. Siempre llamar en un bloque finally."""
    _pool.putconn(conn)


def get_db() -> Generator:
    """
    Generador de dependencia para FastAPI (Depends).

    Cómo funciona el ciclo de vida de una conexión por request:
      1. FastAPI llama a get_db() al inicio del request.
      2. El generador obtiene una conexión del pool y la entrega (yield).
      3. FastAPI inyecta esa conexión en el endpoint como parámetro `db`.
      4. El router la pasa al servicio para ejecutar el SQL.
      5. Al terminar el request (con éxito o con error), FastAPI retoma
         este generador:
           - Sin error  → commit() guarda los cambios en la BD.
           - Con error  → rollback() deshace los cambios (atomicidad).
      6. En cualquier caso, putconn() devuelve la conexión al pool.

    Este patrón garantiza que cada request trabaje en una sola transacción.
    """
    conn = _pool.getconn()
    try:
        yield conn          # aquí el router usa la conexión
        conn.commit()       # si todo salió bien, confirma los cambios
    except Exception:
        conn.rollback()     # si algo falló, deshace los cambios
        raise               # relanza la excepción para que FastAPI la maneje
    finally:
        _pool.putconn(conn) # siempre devuelve la conexión al pool


__all__ = ["get_db", "get_connection", "release_connection", "RealDictCursor"]
