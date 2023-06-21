from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from wugserver.dependencies import get_db
from wugserver.models.user_authentication import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    get_user_from_token,
)
from wugserver.models.user_model import UserModel
from wugserver.models.user_password_model import UserPasswordModel
from wugserver.schema.authentication import Token

router = APIRouter()


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    user_password_model: UserPasswordModel = Depends(UserPasswordModel),
    user_model: UserModel = Depends(UserModel),
):
    user = authenticate_user(
        form_data.username, form_data.password, user_password_model, user_model
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"auth": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/verification")
async def email_verification(token: str, user_model: UserModel = Depends(UserModel)):
    user = await get_user_from_token(token, user_model)
    if not user.is_active:
        user_model.activate_user(user)


@router.get("/verification/token/{token}")
async def email_verification(token: str, user_model: UserModel = Depends(UserModel)):
    user = await get_user_from_token(token, user_model)
    if not user.is_active:
        user_model.activate_user(user)
