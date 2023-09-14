import datetime
from uuid import UUID, uuid4
from fastapi import Depends
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Session
from wugserver.database import Base
from wugserver.dependencies import get_db
from wugserver.schema.user import *


# DB Schema
class MessageDraftRecord(Base):
    __tablename__ = "message_drafts"

    id = Column(Uuid, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    draft = Column(String)
    modified = Column(
        DateTime,
        default=datetime.datetime.utcnow(),
        onupdate=datetime.datetime.utcnow(),
    )


class MessageDraftDbModel:
    def __init__(self, db: Session = Depends(get_db)) -> None:
        self.db = db

    def create_draft(self, user_id: int, draft: str):
        record = MessageDraftRecord(id=uuid4(), user_id=user_id, draft=draft)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def update_record(self, id: UUID, new_draft: str):
        record = self.db.query(MessageDraftRecord).get(id)
        if record != None:
            record.draft = new_draft
            self.db.commit()
            self.db.refresh(record)

    def get_user_drafts(self, user_id: int):
        return (
            self.db.query(MessageDraftRecord)
            .filter(MessageDraftRecord.user_id == user_id)
            .all()
        )

    def get_draft(self, id: UUID):
        return self.db.query(MessageDraftRecord).get(id)

    def delete_draft(self, id: UUID):
        self.db.query(MessageDraftRecord).filter(MessageDraftRecord.id == id).delete()
        self.db.flush()
        self.db.commit()
