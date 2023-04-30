import datetime
from wugserver.database import Base
from sqlalchemy import Column, DateTime, Index, Integer, String, Uuid
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from wugserver.schema.interaction import InteractionCreate

class InteractionModel(Base):
  __tablename__ = "interactions"

  id = Column(Uuid, primary_key=True)
  creatorUserId = Column(Uuid, index=True)
  title = Column(String)
  # created = Column(DateTime)
  last_updated = Column(DateTime)

Index("last_updated_composite_index", InteractionModel.creatorUserId, InteractionModel.last_updated)

def create_interaction(db: Session, interactionCreateParams: InteractionCreate):
  interaction = InteractionModel(
    id=uuid4(),
    creatorUserId=interactionCreateParams.creatorUserId,
    title=interactionCreateParams.title,
    last_updated=datetime.datetime.now()
  )
  db.add(interaction)
  db.commit()
  db.refresh(interaction)
  return interaction

def set_interaction_update_time(db: Session, interactionId: UUID):
  interaction = get_interaction_by_id(db, interactionId)
  if interaction:
    interaction.last_updated=datetime.datetime.now()
    db.commit()
    db.refresh(interaction)
  return interaction

def get_interaction_by_id(db: Session, interactionId: UUID):
  return db.query(InteractionModel) \
    .filter(InteractionModel.id == interactionId).first()

def get_interactions_by_creator_user_id(db: Session, creatorUserId: int, limit: int, offset: int):
  # TODO: actually filter by user id
  return db.query(InteractionModel) \
    .filter(InteractionModel.creatorUserId == creatorUserId) \
    .order_by(InteractionModel.last_updated.desc()) \
    .limit(limit) \
    .offset(offset) \
    .all()
