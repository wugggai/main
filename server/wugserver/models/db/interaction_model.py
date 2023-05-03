import datetime
from wugserver.database import Base
from sqlalchemy import Column, DateTime, Index, Integer, String, Uuid
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from wugserver.schema.interaction import InteractionCreate

class InteractionModel(Base):
  __tablename__ = "interactions"

  id = Column(Uuid, primary_key=True)
  creator_user_id = Column(Uuid, index=True)
  title = Column(String)
  # created = Column(DateTime)
  last_updated = Column(DateTime)

Index("last_updated_composite_index", InteractionModel.creator_user_id, InteractionModel.last_updated)

def create_interaction(db: Session, interaction_create_params: InteractionCreate):
  interaction = InteractionModel(
    id=uuid4(),
    creator_user_id=interaction_create_params.creator_user_id,
    title=interaction_create_params.title,
    last_updated=datetime.datetime.now()
  )
  db.add(interaction)
  db.commit()
  db.refresh(interaction)
  return interaction

def set_interaction_update_time(db: Session, interaction_id: UUID):
  interaction = get_interaction_by_id(db, interaction_id)
  if interaction:
    interaction.last_updated=datetime.datetime.now()
    db.commit()
    db.refresh(interaction)
  return interaction

def get_interaction_by_id(db: Session, interaction_id: UUID):
  return db.query(InteractionModel) \
    .filter(InteractionModel.id == interaction_id).first()

def get_interactions_by_creator_user_id(db: Session, creator_user_id: int, limit: int, offset: int):
  # TODO: actually filter by user id
  return db.query(InteractionModel) \
    .filter(InteractionModel.creator_user_id == creator_user_id) \
    .order_by(InteractionModel.last_updated.desc()) \
    .limit(limit) \
    .offset(offset) \
    .all()
