
from requests import Session
from sqlalchemy import Column, String, Uuid
from wugserver.database import Base
from sqlalchemy.orm import Session
import hashlib


class UserPasswordModel(Base):
    __tablename__ = "user_password"

    user_id = Column(Uuid, primary_key=True)
    hashed_password = Column(String)

def create_user_password(db: Session, user_id: Uuid, password: String):
  hashed_password = hashlib.sha256(password).hexdigest()
  db_user_password = UserPasswordModel(user_id, hashed_password)
  db.add(db_user_password)
  db.commit()
  db.refresh(db_user_password)
  return db_user_password

def get_user_hashed_password(db: Session, user_id: Uuid):
  return db.query(UserPasswordModel).get(user_id)
