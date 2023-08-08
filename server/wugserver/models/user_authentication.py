from datetime import timedelta, datetime
import json
import os
from typing import Union
from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from wugserver.dependencies import get_db

from wugserver.constants import ENV, Environment
from wugserver.models.db.user_db_model import UserRecord
from wugserver.models.external.sendgrid import send_verification_email
from wugserver.models.user_model import UserModel
from wugserver.models.user_password_model import UserPasswordModel
from wugserver.schema.user import UserCreate

SECRET_KEY = os.environ.get("AUTH_SIGNING_KEY")
if not SECRET_KEY:
    SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 7 * 24 * 60
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token", auto_error=False)


def authenticate_user(
    email: str,
    password: str,
    user_password_model: UserPasswordModel,
    user_model: UserModel,
):
    user = user_model.get_user_by_email(email)
    if not user:
        return False
    if not user_password_model.verify_user_password(user.id, password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if not expires_delta:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_user_from_token(token: str, user_model: UserModel):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("auth")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = user_model.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user


async def get_user_from_cookie_or_auth_header(
    user_model: UserModel = Depends(UserModel),
    access_token: str = Cookie(None),
    token: str = Depends(oauth2_scheme),
):
    if access_token is not None:
        token = access_token
    return await get_user_from_token(token, user_model)


def get_current_active_user(
    current_user: UserRecord = Depends(get_user_from_cookie_or_auth_header),
) -> UserRecord:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# register_user: sends verification link to email provided by user
#   returns: UserModel object representing the new user
#   raises: InternalServerError if email cannot be sent
def register_user(
    db: Session,
    user: UserCreate,
    user_password_model: UserPasswordModel,
    user_model: UserModel,
):
    token = create_access_token(
        data={"auth": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    if ENV is not Environment.dev:
        try:
            res = send_verification_email(user.email, token)
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Could not send verification email to {user.email}: {e}",
            )
        if not 200 <= int(res.status_code) <= 299:
            res_json = json.loads(res.body)
            raise HTTPException(
                status_code=503,
                detail=f"Could not send verification email to {email}: {res_json['errors']}",
            )

    db_user = user_model.create_db_user(user)
    if user.password:
        user_password_model.create_user_password(db_user.id, user.password)
    if ENV is Environment.dev:
        user_model.activate_user(db_user)
    return db_user
