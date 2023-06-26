import datetime
from uuid import UUID
from fastapi import Depends
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Uuid
from sqlalchemy.orm import Session, relationship
from wugserver.database import Base
from wugserver.dependencies import get_db


class MessageFavoriteRecord(Base):
    __tablename__ = "message_favorite"

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        primary_key=True,
    )
    message_id = Column(
        Uuid,
        ForeignKey("messages.id", ondelete="CASCADE"),
        index=True,
        primary_key=True,
    )
    message = relationship("MessageRecord", back_populates="favorites")

    timestamp = Column(DateTime, default=datetime.datetime.utcnow())


class MessageFavoriteDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_message_favorite(self, user_id: int, message_id: UUID):
        record = MessageFavoriteRecord(
            user_id=user_id,
            message_id=message_id,
            timestamp=datetime.datetime.utcnow(),
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def delete_message_favorite(self, user_id: int, message_id: UUID):
        self.db.query(MessageFavoriteRecord).filter(
            MessageFavoriteRecord.user_id == user_id
            and MessageFavoriteRecord.message_id == message_id
        ).delete()
        self.db.flush()
        self.db.commit()

    # add pagination when performance becomes an issue
    def get_favorite_messages_by_user(self, user_id: int):
        return (
            self.db.query(MessageFavoriteRecord)
            .filter(MessageFavoriteRecord.user_id == user_id)
            .order_by(MessageFavoriteRecord.timestamp)
            .all()
        )
