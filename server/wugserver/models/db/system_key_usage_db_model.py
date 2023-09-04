import datetime
from fastapi import Depends
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from wugserver.constants import Provider
from wugserver.database import Base
from wugserver.dependencies import get_db


class SystemKeyUsageRecord(Base):
    __tablename__ = "system_key_usage"

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        primary_key=True,
    )
    provider = Column(
        String(32),
        index=True,
        primary_key=True,
    )
    counter = Column(Integer)

    timestamp = Column(DateTime, default=datetime.datetime.utcnow())


class SystemKeyUsageDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_system_key_usage(self, user_id: int, provider: Provider):
        record = SystemKeyUsageRecord(user_id=user_id, provider=provider, counter=1)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_user_system_key_usage(self, user_id: int, provider: Provider):
        return (
            self.db.query(SystemKeyUsageRecord)
            .filter(
                SystemKeyUsageRecord.user_id == user_id
                and SystemKeyUsageRecord.provider == provider
            )
            .one_or_none()
        )

    def increment_user_system_key_usage(self, user_id: int, provider: Provider):
        record = (
            self.db.query(SystemKeyUsageRecord)
            .filter(
                SystemKeyUsageRecord.user_id == user_id
                and SystemKeyUsageRecord.provider == provider
            )
            .first()
        )

        record.counter += 1
        self.db.commit()
        self.db.refresh(record)
