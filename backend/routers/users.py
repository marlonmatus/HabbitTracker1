from fastapi import APIRouter, Depends
from database import get_db, RealDictCursor
from models.user import UserCreate, UserResponse
from services import user_service
from routers.deps import validate_uuid_param

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(payload: UserCreate, db=Depends(get_db)):
    return user_service.create_user(db, payload)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db=Depends(get_db)):
    validate_uuid_param(user_id, "user_id")
    return user_service.get_user_by_id(db, user_id)
