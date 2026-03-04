import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

load_dotenv()

# Importar database antes que los routers para que el pool se cree
# en el arranque y falle rápido si DATABASE_URL no está definido.
import database  # noqa: F401, E402
from limiter import limiter
from routers import users, habits, habit_logs, progress, tips

app = FastAPI(title="HabitTracker API", version="2.0.0")

# Adjuntar el limiter al estado de la app y registrar el manejador de 429.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(habits.router)
app.include_router(habit_logs.router)
app.include_router(progress.router)
app.include_router(tips.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
