
from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from wugserver.dependencies import get_db
from wugserver.models.user_authentication import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, get_user_from_token

from wugserver.schema.authentication import Token


router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(
  form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)
):
  user = authenticate_user(db, form_data.username, form_data.password)
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
def email_verification(token: str, db: Session = Depends(get_db)):
  user = get_user_from_token(db, token)
  if not user.is_active:
    user.is_active = True
    db.commit()
    db.refresh(user)

@router.get("/verification/token/{token}")
def email_verification(token: str, db: Session = Depends(get_db)):
  user = get_user_from_token(db, token)
  if not user.is_active:
    user.is_active = True
    db.commit()
    db.refresh(user)
