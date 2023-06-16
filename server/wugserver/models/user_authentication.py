from datetime import timedelta, datetime
from typing import Annotated, Union
from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from wugserver.dependencies import get_db

from wugserver.models.db.user_model import UserModel, create_db_user, get_user_by_email
from wugserver.models.db.user_password_model import verify_user_password
from wugserver.models.external.sendgrid import send_verification_email
from wugserver.schema.user import UserCreate

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token", auto_error=False)

def authenticate_user(db: Session, email: str, password: str):
  user = get_user_by_email(db, email)
  if not user:
    return False
  if not verify_user_password(db, user.id, password):
    return False
  return user

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.utcnow() + expires_delta
  else:
    expire = datetime.utcnow() + timedelta(minutes=15)
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt

def get_user_from_token(db: Session, token: str):
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
  user = get_user_by_email(db, email)
  if user is None:
    raise credentials_exception
  return user

def get_user_from_cookie_or_auth_header(
    db: Session = Depends(get_db),
    access_token: str = Cookie(None),
    token: str = Depends(oauth2_scheme),
  ):
  if access_token is not None:
    token = access_token
  return get_user_from_token(db=db, token=token)

async def get_current_active_user(
  current_user: UserModel = Depends(get_user_from_cookie_or_auth_header)
):
  if not current_user.is_active:
    raise HTTPException(status_code=400, detail='Inactive user')
  return current_user

# register_user: sends verification link to email provided by user
#   returns: UserModel object representing the new user
#   raises: InternalServerError if email cannot be sent
def register_user(db: Session, user: UserCreate, requestDomain: str):
  token = create_access_token(data={"auth": user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
  res = send_verification_email(user.email, token, requestDomain)
  if 200 <= int(res.status_code) <= 299:
    db_user = create_db_user(db, user)
    return db_user

  res_json = json.loads(res.body)
  raise HTTPException(status_code=503, detail=f"Could not send verification email to {email}: {res_json['errors']}")
