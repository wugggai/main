import datetime

from fastapi import Depends
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Session

from wugserver.database import Base
from wugserver.dependencies import get_db
from wugserver.schema.user import *


# DB Schema
class OnboardingHistoryRecord(Base):
    __tablename__ = "onboardinghistory"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    onboarding_type = Column(String(64), primary_key=True)
    count = Column(Integer)
    last_done = Column(DateTime)


class OnboardingHistoryDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_or_increment_onboarding_history(
        self,
        user_id: int,
        type: str,
    ) -> OnboardingHistoryRecord:
        record = (
            self.db.query(OnboardingHistoryRecord)
            .filter(
                OnboardingHistoryRecord.user_id == user_id,
                OnboardingHistoryRecord.onboarding_type == type,
            )
            .first()
        )
        if record != None:
            record.count += 1
            record.last_done = datetime.datetime.utcnow()
        else:
            record = OnboardingHistoryRecord(
                user_id=user_id,
                onboarding_type=type,
                count=1,
                last_done=datetime.datetime.utcnow(),
            )
            self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_user_onboarding_history(self, user_id: int, type: str):
        return (
            self.db.query(OnboardingHistoryRecord)
            .filter(
                OnboardingHistoryRecord.user_id == user_id,
                OnboardingHistoryRecord.onboarding_type == type,
            )
            .first()
        )
