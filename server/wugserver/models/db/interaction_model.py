import datetime
from wugserver.database import Base
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, relationship, Session
from uuid import UUID, uuid4
from wugserver.models.db.interaction_tag_association import interaction_tag_association_table
from wugserver.models.db.tag_model import TagModel
from wugserver.schema.interaction import InteractionCreate, InteractionUpdate

class InteractionModel(Base):
  __tablename__ = "interactions"

  id = Column(Uuid, primary_key=True)
  creator_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
  title = Column(String)
  tags: Mapped[list[TagModel]] = relationship(
    secondary=interaction_tag_association_table,
    back_populates="interactions",
  )
  last_updated = Column(DateTime)
  deleted = Column(Boolean, default=False)

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

def get_interaction_by_id(db: Session, interaction_id: UUID, include_deleted: bool = False) -> InteractionModel | None:
  filters = [InteractionModel.id == interaction_id]
  if not include_deleted:
    filters.append(InteractionModel.deleted == False)

  return db.query(InteractionModel) \
    .filter(*filters) \
    .one_or_none()

def get_interactions_by_creator_user_id(db: Session, creator_user_id: int, limit: int, offset: int, include_deleted: bool = False):
  filters = [InteractionModel.creator_user_id == creator_user_id]
  if not include_deleted:
    filters.append(InteractionModel.deleted == False)

  return db.query(InteractionModel) \
    .filter(*filters) \
    .order_by(InteractionModel.last_updated.desc()) \
    .limit(limit) \
    .offset(offset) \
    .all()

def get_deleted_interactions_by_creator_user_id(db: Session, creator_user_id: int, limit: int, offset: int):
  filters = [InteractionModel.creator_user_id == creator_user_id, InteractionModel.deleted == True]
  return db.query(InteractionModel) \
    .filter(*filters) \
    .order_by(InteractionModel.last_updated.desc()) \
    .limit(limit) \
    .offset(offset) \
    .all()

def update_interaction(db: Session, interaction_id: UUID, interaction_update_params: InteractionUpdate):
  interaction = get_interaction_by_id(db, interaction_id)
  if interaction is not None:
    if interaction_update_params.tag_ids is not None:
      # TODO: should throw error if an invalid id passed
      interaction.tags = db.query(TagModel) \
        .filter(TagModel.id.in_(interaction_update_params.tag_ids)) \
        .all()

    if interaction_update_params.title is not None:
      interaction.title = interaction_update_params.title
    if interaction_update_params.deleted is not None:
      interaction.deleted = interaction_update_params.deleted
    return set_interaction_update_time_and_commit(db, interaction.id)
  return None

def delete_interaction(db: Session, interaction_id: UUID):
  to_delete = db.query(InteractionModel).filter(InteractionModel.id == interaction_id).delete()
  db.flush()
  db.commit()
  return to_delete
