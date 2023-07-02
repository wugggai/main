import enum
from sqlalchemy import Enum
from wugserver.database import Base

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, relationship, Session

class MessageContentTypes(enum.Enum):
    text = 1
    image = 2


class MessageContentRecord(Base):
    __tablename__ = "message_contents"

    message_id = Column(
        Uuid,
        ForeignKey("messages.id", ondelete="CASCADE"),
        index=True,
        primary_key=True,
    )
    type = Column(Enum(MessageContentTypes))
    content = Column(Text)
    order = Column(Integer)
    messages = relationship("MessageRecord")
