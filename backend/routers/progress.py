from fastapi import APIRouter, Depends
from database import get_db
from models.progress import WeeklyProgressResponse
from services import progress_service
from routers.deps import validate_uuid_param

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/", response_model=list[WeeklyProgressResponse])
def get_weekly_progress(user_id: str, db=Depends(get_db)):
    validate_uuid_param(user_id, "user_id")
    return progress_service.get_weekly_progress(db, user_id)
