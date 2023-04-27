import datetime
from uuid import UUID, uuid4
from wugserver.database import Base
from sqlalchemy import Column, DateTime, Integer, String, Uuid
from sqlalchemy.orm import Session

from wugserver.schema.message_role import MessageRole

class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(Uuid, primary_key=True)
    interactionId = Column(Uuid, index=True)
    role = Column(String)
    content = Column(String)
    offset = Column(Integer)
    timestamp = Column(DateTime)

    def toOpenaiMessage(self):
        return {"role": self.role, "content": self.content}



def create_message(db: Session, interactionId: UUID, role: MessageRole, content: str, offset: Integer):
    message = MessageModel(id=uuid4(), interactionId=interactionId, role=role, content=content, offset=offset, timestamp=datetime.datetime.now())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_interaction_messages(db: Session, interactionId: UUID):
    return db.query(MessageModel).filter(MessageModel.interactionId == interactionId).order_by(MessageModel.offset.asc()).all()
