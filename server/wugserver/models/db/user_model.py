from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import Session
from wugserver.database import Base
from wugserver.schema.user import *

# DB Schema
class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

def create_user(db: Session, user: UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = UserModel(email=user.email, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(UserModel).filter(UserModel.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(UserModel).offset(skip).limit(limit).all()
