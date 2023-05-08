import datetime
from wugserver.database import Base
from sqlalchemy import Column, DateTime, Index, Integer, String, Uuid
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, relationship, Session
from uuid import UUID, uuid4
from wugserver.models.db.interaction_tag_association import interaction_tag_association_table
from wugserver.models.db.tag_model import TagModel
from wugserver.schema.interaction import InteractionCreate, InteractionUpdate

class InteractionModel(Base):
  __tablename__ = "interactions"

  id = Column(Uuid, primary_key=True)
  creator_user_id = Column(Uuid, index=True)
  title = Column(String)
  tags: Mapped[list[TagModel]] = relationship(
    secondary=interaction_tag_association_table,
    back_populates="interactions",
  )
  last_updated = Column(DateTime)

  @hybrid_property
  def tag_ids(self):
    return [tag.id for tag in self.tags]

Index("last_updated_composite_index", InteractionModel.creator_user_id, InteractionModel.last_updated)

def create_interaction(db: Session, creator_user_id: UUID, interaction_create_params: InteractionCreate):
  interaction = InteractionModel(
    id=uuid4(),
    creator_user_id=creator_user_id,
    title=interaction_create_params.title,
    last_updated=datetime.datetime.now()
  )
  db.add(interaction)
  db.commit()
  db.refresh(interaction)
  return interaction

def set_interaction_update_time_and_commit(db: Session, interaction_id: UUID):
  interaction = get_interaction_by_id(db, interaction_id)
  interaction.last_updated=datetime.datetime.now()
  db.commit()
  db.refresh(interaction)
  return interaction

def get_interaction_by_id(db: Session, interaction_id: UUID):
  return db.query(InteractionModel) \
    .get(interaction_id)

def get_interactions_by_creator_user_id(db: Session, creator_user_id: int, limit: int, offset: int):
  return db.query(InteractionModel) \
    .filter(InteractionModel.creator_user_id == creator_user_id) \
    .order_by(InteractionModel.last_updated.desc()) \
    .limit(limit) \
    .offset(offset) \
    .all()

def update_interaction(db: Session, interaction_id: UUID, interaction_update_params: InteractionUpdate):
  interaction = get_interaction_by_id(db, interaction_id)
  interaction.title = interaction_update_params.title
  # TODO: should throw error if an invalid id passed
  interaction.tags = db.query(TagModel) \
    .filter(TagModel.id.in_(interaction_update_params.tag_ids)) \
    .all()
  return set_interaction_update_time_and_commit(db, interaction_id)
