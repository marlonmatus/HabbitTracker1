from pydantic import BaseModel


class WeeklyProgressResponse(BaseModel):
    habit_id: str
    habit_name: str
    days_completed: int
    percentage: float
