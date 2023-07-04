import enum
from fastapi import Depends
from sqlalchemy import Enum
from uuid import UUID
from wugserver.database import Base
from wugserver.dependencies import get_db

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, relationship, Session
from wugserver.schema.message import MessageTypes


class MessageContentRecord(Base):
    __tablename__ = "message_contents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    message_id = Column(
        Uuid,
        ForeignKey("messages.id", ondelete="CASCADE"),
        index=True,
    )
    type = Column(Enum(MessageTypes))
    content = Column(Text)
    order = Column(Integer)
