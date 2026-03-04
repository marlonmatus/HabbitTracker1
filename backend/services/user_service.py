from fastapi import HTTPException
from psycopg2.extensions import connection as PgConnection
from psycopg2.extras import RealDictCursor
from models.user import UserCreate, UserResponse


def create_user(conn: PgConnection, payload: UserCreate) -> UserResponse:
    """
    Crea un usuario nuevo.

    Usa INSERT ... ON CONFLICT DO NOTHING en lugar del patrón SELECT + INSERT,
    que tiene una condición de carrera (TOCTOU): dos requests simultáneos con
    el mismo email podrían pasar ambos el SELECT y luego el segundo INSERT
    lanzaría UniqueViolation no capturada → HTTP 500 en lugar de 409.

    Con ON CONFLICT DO NOTHING, si el email ya existe la BD no inserta nada
    y RETURNING devuelve vacío; lo detectamos y respondemos 409 de forma segura.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO users (email, display_name)
            VALUES (%s, %s)
            ON CONFLICT (email) DO NOTHING
            RETURNING *
            """,
            (payload.email, payload.display_name),
        )
        row = cur.fetchone()

        # RETURNING vacío significa que el email ya existía en la tabla
        if not row:
            raise HTTPException(
                status_code=409,
                detail="Ya existe un usuario con ese email.",
            )

        return UserResponse(**row)


def get_user_by_id(conn: PgConnection, user_id: str) -> UserResponse:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        return UserResponse(**row)


def get_user_by_email(conn: PgConnection, email: str) -> UserResponse:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        return UserResponse(**row)
