import datetime

from fastapi import Depends
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Session

from wugserver.database import Base
from wugserver.dependencies import get_db
from wugserver.schema.api_key import ApiKeyCreate
from wugserver.schema.user import *


# DB Schema
class ApiKeyRecord(Base):
    __tablename__ = "apikeys"

    owner_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    provider = Column(String(32), primary_key=True)
    api_key = Column(String(128))
    created = Column(DateTime, default=datetime.datetime.utcnow())


class ApiKeyDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_api_key(
        self,
        user_id: int,
        provider: str,
        key: str,
    ) -> ApiKeyRecord:
        db_api_key = ApiKeyRecord(owner_user_id=user_id, provider=provider, api_key=key)
        self.db.add(db_api_key)
        self.db.commit()
        self.db.refresh(db_api_key)
        return db_api_key

    def update_api_key(
        self,
        user_id: int,
        provider: str,
        key: str,
    ) -> ApiKeyRecord:
        db_api_key = self.get_api_key_by_provider(user_id=user_id, provider=provider)
        db_api_key.api_key = key
        self.db.commit()
        self.db.refresh(db_api_key)
        return db_api_key

    def delete_api_key(
        self,
        user_id: int,
        provider: str,
    ):
        keyRec = self.get_api_key_by_provider(user_id, provider)
        if keyRec:
            self.db.delete(keyRec)
            self.db.commit()

    def get_api_key_by_provider(self, user_id: int, provider: str):
        return (
            self.db.query(ApiKeyRecord)
            .filter(
                ApiKeyRecord.owner_user_id == user_id, ApiKeyRecord.provider == provider
            )
            .first()
        )

    def get_all_api_keys(
        self,
        user_id: int,
    ):
        return (
            self.db.query(ApiKeyRecord)
            .filter(ApiKeyRecord.owner_user_id == user_id)
            .all()
        )
