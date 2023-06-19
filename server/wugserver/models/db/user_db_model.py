from fastapi import Depends
from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import Session
from wugserver.database import Base
from wugserver.dependencies import get_db
from wugserver.schema.user import *


# DB Schema
class UserRecord(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=False)
    deleted = Column(Boolean, default=False)


class UserDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_db_user(self, user: UserCreate):
        db_user = UserRecord(email=user.email)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_user_by_email(self, email: str):
        return self.db.query(UserRecord).filter(UserRecord.email == email).first()

    def activate_user(self, user_record: UserRecord):
        user_record.is_active = True
        self.db.commit()
        self.db.refresh(user_record)
