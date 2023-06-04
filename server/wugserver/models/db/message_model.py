import datetime
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, text, Uuid
from sqlalchemy.orm import Session

from wugserver.database import Base
from wugserver.models.db.interaction_model import InteractionModel

# TODO: Message table should store userId
class MessageModel(Base):
  __tablename__ = "messages"

  id = Column(Uuid, primary_key=True)
  interaction_id = Column(Uuid, ForeignKey("interactions.id", ondelete="CASCADE"), index=True)
  source = Column(String)
  message = Column(String)
  offset = Column(Integer)
  timestamp = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

Index("offset_composite_index", MessageModel.interaction_id, MessageModel.offset)

def create_message(db: Session, interaction: InteractionModel, source: str, message: str, offset: Integer):
  message = MessageModel(
    id=uuid4(),
    interaction_id=interaction.id,
    source=source,
    message=message,
    offset=offset,
    timestamp=datetime.datetime.now()
  )
  db.add(message)
  db.commit()
  db.refresh(message)
  return message

def get_interaction_messages(db: Session, interaction: InteractionModel, offset:int, limit: int, from_latest: bool = True):
  query = None
  if from_latest:
    query = db.query(MessageModel) \
      .filter(MessageModel.interaction_id == interaction.id) \
      .order_by(MessageModel.offset.desc())
  else:
    query = db.query(MessageModel) \
      .filter(MessageModel.interaction_id == interaction.id) \
      .order_by(MessageModel.offset.asc())
  return query.limit(limit) \
      .offset(offset) \
      .all()

def get_interaction_last_message(db: Session, interaction: InteractionModel):
  last_message_in_list = get_interaction_messages(db, interaction, 0, 1, True)
  return last_message_in_list[0] if last_message_in_list else None

def get_interaction_all_messages(db: Session, interaction: InteractionModel):
  return get_interaction_messages(db, interaction.id, 0, 100000, False)

def get_interaction_message_count(db: Session, interaction: InteractionModel):
  return db.query(MessageModel) \
    .filter(MessageModel.interaction_id == interaction.id) \
    .count()

def delete_interaction_messages(db: Session, interaction_id: UUID):
  return db.query(MessageModel) \
    .filter(MessageModel.interaction_id == interaction_id) \
    .delete()
