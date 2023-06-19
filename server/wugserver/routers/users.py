from fastapi import APIRouter, Depends, HTTPException, Request
from wugserver.dependencies import get_db
from wugserver.models.user_authentication import get_current_active_user, register_user
from wugserver.models.user_model import UserModel
from wugserver.models.user_password_model import UserPasswordModel
from wugserver.schema.user import User, UserCreate
from sqlalchemy.orm import Session
from wugserver.models.db.user_db_model import UserRecord

router = APIRouter()


@router.post("/users", response_model=User)
def create_user_route(
    user: UserCreate,
    db: Session = Depends(get_db),
    user_password_model: UserPasswordModel = Depends(UserPasswordModel),
    user_model: UserModel = Depends(UserModel),
):
    db_user = user_model.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    return register_user(
        db=db,
        user=user,
        user_password_model=user_password_model,
        user_model=user_model,
    )


@router.get("/users/me", response_model=User)
def read_users_me(
    current_user: UserRecord = Depends(get_current_active_user),
):
    return current_user
