
from requests import Session
from sqlalchemy import Column, ForeignKey, Integer, String, Uuid
from wugserver.database import Base
from sqlalchemy.orm import Session
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserPasswordModel(Base):
    __tablename__ = "user_password"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    hashed_password = Column(String, nullable=False)

def create_user_password(db: Session, user_id: Uuid, password: str):
  hashed_password = pwd_context.hash(password)
  db_user_password = UserPasswordModel(user_id=user_id, hashed_password=hashed_password)
  db.add(db_user_password)
  db.commit()
  db.refresh(db_user_password)
  return db_user_password

def get_user_hashed_password(db: Session, user_id: Uuid):
  return db.query(UserPasswordModel).get(user_id)

def verify_user_password(db: Session, user_id: Uuid, raw_password: str):
  result = db.query(UserPasswordModel).get(user_id)
  return result and pwd_context.verify(raw_password, result.hashed_password)
