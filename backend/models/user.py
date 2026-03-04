from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    display_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    created_at: datetime
