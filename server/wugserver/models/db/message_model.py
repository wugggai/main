import datetime
from uuid import UUID, uuid4
from sqlalchemy import Column, DateTime, Index, Integer, String, text, Uuid
from sqlalchemy.orm import Session

from wugserver.database import Base

# TODO: Message table should store userId
class MessageModel(Base):
  __tablename__ = "messages"

  id = Column(Uuid, primary_key=True)
  interactionId = Column(Uuid, index=True)
  source = Column(String)
  message = Column(String)
  offset = Column(Integer)
  timestamp = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

Index("offset_composite_index", MessageModel.interactionId, MessageModel.offset)

def write_message_to_db(db: Session, interactionId: UUID, source: str, message: str, offset: Integer):
  message = MessageModel(
    id=uuid4(),
    interactionId=interactionId,
    source=source,
    message=message,
    offset=offset,
    timestamp=datetime.datetime.now()
  )
  db.add(message)
  db.commit()
  db.refresh(message)
  return message

def get_interaction_messages(db: Session, interactionId: UUID, offset:int, limit: int, from_latest: bool = True):
  if from_latest:
    return db.query(MessageModel) \
      .filter(MessageModel.interactionId == interactionId) \
      .order_by(MessageModel.offset.desc()) \
      .limit(limit) \
      .offset(offset) \
      .all()
  else:
    return db.query(MessageModel) \
      .filter(MessageModel.interactionId == interactionId) \
      .order_by(MessageModel.offset.asc()) \
      .limit(limit) \
      .offset(offset) \
      .all()

def get_interaction_last_message(db: Session, interactionId: UUID):
  last_message_in_list = get_interaction_messages(db, interactionId, 0, 1, True)
  return last_message_in_list[0] if last_message_in_list else None

def get_interaction_all_messages(db: Session, interactionId: UUID):
  return get_interaction_messages(db, interactionId, 0, 10000, False)
