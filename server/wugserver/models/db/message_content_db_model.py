import enum
from fastapi import Depends
from sqlalchemy import Enum
from uuid import UUID
from wugserver.database import Base
from wugserver.dependencies import get_db

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, relationship, Session

class MessageContentTypes(enum.Enum):
    text = 1
    image = 2


class MessageContentRecord(Base):
    __tablename__ = "message_contents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    message_id = Column(
        Uuid,
        ForeignKey("messages.id", ondelete="CASCADE"),
        index=True,
    )
    type = Column(Enum(MessageContentTypes))
    content = Column(Text)
    order = Column(Integer)

    # dummy record to resolve relationship to messages table
    messages = relationship("MessageRecord")


class MessageContentDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_message_content_record(self, message_id: UUID, type: str, content: str, order: int):
        try:
            _type = MessageContentTypes[type]
        except KeyError:
            raise ValueError(f"{type} content type is not supported")
        message_content_record = MessageContentRecord(
            message_id=message_id,
            type=type,
            content=content,
            order=order,
        )
        self.db.add(message_content_record)
        self.db.commit()
        self.db.refresh(message_content_record)
        return message_content_record
