from pydantic import BaseModel
from typing import Optional


class WeeklyProgressResponse(BaseModel):
    habit_id: str
    habit_name: str
    days_completed: int
    percentage: float


class ProgressInsightSummary(BaseModel):
    """Resumen para el insight de IA: porcentaje semanal, día fuerte/débil, tendencia, num hábitos."""
    weekly_percentage: float
    strongest_day: int  # 0=lunes, 6=domingo
    weakest_day: int
    trend_vs_previous: str  # "up" | "down" | "same"
    num_habits: int
