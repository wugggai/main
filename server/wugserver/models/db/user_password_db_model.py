from fastapi import Depends
from requests import Session
from sqlalchemy import Column, ForeignKey, Integer, String, Uuid
from wugserver.database import Base
from sqlalchemy.orm import Session
from wugserver.dependencies import get_db


class UserPasswordRecord(Base):
    __tablename__ = "user_password"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    hashed_password = Column(String(128), nullable=False)


class UserPasswordDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_user_password(self, user_id: int, hashed_password: str):
        db_user_password = UserPasswordRecord(
            user_id=user_id, hashed_password=hashed_password
        )
        self.db.add(db_user_password)
        self.db.commit()
        self.db.refresh(db_user_password)
        return db_user_password

    def get_user_hashed_password(self, user_id: int) -> UserPasswordRecord | None:
        return self.db.query(UserPasswordRecord).get(user_id)

    def update_user_password(self, user_id: int, new_hashed_password: str):
        pwd_model = self.get_user_hashed_password(user_id)
        pwd_model.hashed_password = new_hashed_password
        self.db.commit()
        self.db.refresh(pwd_model)
