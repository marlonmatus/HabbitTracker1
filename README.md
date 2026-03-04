# HabitTracker

Aplicación web responsiva para seguimiento de hábitos con consejo motivacional vía Gemini.

## Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Python + FastAPI
- **Base de datos:** Supabase (PostgreSQL)
- **IA:** Google Gemini 1.5 Flash

---

## Configuración inicial

### 1. Base de datos (Supabase)

En el SQL Editor de tu proyecto Supabase, ejecuta el contenido de:

```
backend/database/schema.sql
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env           # Rellena con tus credenciales reales
uvicorn main:app --reload
```

La API queda disponible en `http://localhost:8000`.
Documentación interactiva: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env           # Ajusta VITE_USER_ID si lo necesitas
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

---

## Variables de entorno

### `backend/.env`
| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_KEY` | Clave anon o service role de Supabase |
| `GEMINI_API_KEY` | Clave de la API de Google Gemini |
| `FRONTEND_URL` | URL del frontend (para CORS) |

### `frontend/.env`
| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL del backend FastAPI |
| `VITE_USER_ID` | ID de usuario (temporal hasta integrar auth) |

---

## Estructura del proyecto

```
HabbitTracker1/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── database/
│   │   ├── connection.py
│   │   └── schema.sql          ← users, habits, habit_logs, weekly_insights
│   ├── models/
│   │   ├── user.py
│   │   ├── habit.py
│   │   ├── habit_log.py
│   │   ├── progress.py
│   │   └── weekly_insight.py
│   ├── services/
│   │   ├── user_service.py
│   │   ├── habit_service.py
│   │   ├── habit_log_service.py
│   │   ├── progress_service.py
│   │   └── gemini_service.py   ← caché persistente via weekly_insights
│   └── routers/
│       ├── users.py
│       ├── habits.py
│       ├── habit_logs.py
│       ├── progress.py
│       └── tips.py
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx
        │   └── HabitDetail.jsx
        ├── components/
        │   ├── HabitCard.jsx
        │   ├── HabitForm.jsx
        │   ├── ProgressBar.jsx
        │   └── MotivationalTip.jsx
        ├── hooks/
        │   ├── useHabits.js
        │   └── useProgress.js
        └── services/
            └── api.js
```
