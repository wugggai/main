from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import Session
from wugserver.database import Base
from wugserver.models.db.user_password_model import create_user_password
from wugserver.schema.user import *

# DB Schema
class UserModel(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key=True, index=True)
  email = Column(String, unique=True, index=True)
  is_active = Column(Boolean, default=False)
  deleted = Column(Boolean, default=False)

def create_db_user(db: Session, user: UserCreate):
  db_user = UserModel(email=user.email)
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  if user.password:
    create_user_password(db, db_user.id, user.password)

  return db_user

def get_user_by_email(db: Session, email: str):
  return db.query(UserModel).filter(UserModel.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
  return db.query(UserModel).offset(skip).limit(limit).all()
