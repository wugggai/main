import datetime
import secrets
from fastapi import Depends
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from wugserver.database import Base
from sqlalchemy.orm import Session
from wugserver.dependencies import get_db


class UserForgetPasswordRecord(Base):
    __tablename__ = "user_forget_password"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    secret = Column(String, primary_key=True)
    requested = Column(DateTime, default=datetime.datetime.utcnow())


class UserForgetPasswordDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_forget_password_secret(self, user_id: int):
        secret = secrets.token_urlsafe(16)
        db_record = self._get_record_from_user_id(user_id)
        if db_record:
            db_record.secret = secret
            db_record.requested = datetime.datetime.utcnow()
        else:
            db_record = UserForgetPasswordRecord(user_id=user_id, secret=secret)
            self.db.add(db_record)
        self.db.commit()
        self.db.refresh(db_record)
        return db_record

    def _get_record_from_user_id(self, user_id: int) -> UserForgetPasswordRecord | None:
        return (
            self.db.query(UserForgetPasswordRecord)
            .filter(UserForgetPasswordRecord.user_id == user_id)
            .first()
        )

    def get_record_from_secret(self, secret: str) -> UserForgetPasswordRecord | None:
        return self.db.query(UserForgetPasswordRecord).get(secret)
