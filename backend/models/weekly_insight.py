from pydantic import BaseModel
from datetime import date, datetime


class WeeklyInsightResponse(BaseModel):
    id: str
    user_id: str
    week_start: date
    tip: str
    generated_at: datetime
