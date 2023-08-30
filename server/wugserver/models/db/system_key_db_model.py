import datetime
from fastapi import Depends
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from wugserver.constants import Provider
from wugserver.database import Base
from wugserver.dependencies import get_db


class SystemKeyRecord(Base):
    __tablename__ = "system_key"

    provider = Column(
        String,
        index=True,
        primary_key=True,
    )
    key = Column(String)
    # how many time a user can use this key
    limit = Column(Integer)


class SystemKeyDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_system_key_by_provider(self, provider: Provider):
        return (
            self.db.query(SystemKeyRecord)
            .filter(SystemKeyRecord.provider == provider)
            .one_or_none()
        )

    def get_all_system_key(self):
        return self.db.query(SystemKeyRecord).all()
