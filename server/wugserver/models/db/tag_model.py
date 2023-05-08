import datetime
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, Index, String, Uuid
from sqlalchemy.orm import Mapped, relationship, Session

from wugserver.database import Base
from wugserver.models.db.interaction_tag_association import interaction_tag_association_table
from wugserver.schema.tag import Tag, TagCreate


class TagModel(Base):
  __tablename__ = "tags"

  id = Column(Uuid, primary_key=True)
  creator_user_id = Column(Uuid, index=True)
  name = Column(String)
  color = Column(String(7))
  interactions: Mapped[list['wugserver.models.db.interaction_model.InteractionModel']] = relationship(
    secondary=interaction_tag_association_table,
    back_populates="tags",
  )
  last_use = Column(DateTime)

Index("last_use_composite_index", TagModel.creator_user_id, TagModel.last_use)

def create_tag(db: Session, user_id: UUID, tag_create_params: TagCreate):
  # Enforce 0 constraint on db level
  # As a result, one user may reuse same name/color for multiple tags
  tag = TagModel(
    id=uuid4(),
    creator_user_id=user_id,
    name=tag_create_params.name,
    color=tag_create_params.color,
    last_use=datetime.datetime.now(),
  )
  db.add(tag)
  db.commit()
  db.refresh(tag)
  return tag

def get_tags_by_user_id(db: Session, user_id: UUID):
  return db.query(TagModel) \
    .filter(TagModel.creator_user_id == user_id) \
    .order_by(TagModel.last_use.desc()) \
    .all()

def get_tag_by_id(db: Session, id: UUID):
  return db.query(TagModel) \
    .filter(TagModel.id == id) \
    .one()

def update_tag(db: Session, tag_id: UUID, tag_update_params: TagCreate):
  tag = get_tag_by_id(db, tag_id)
  tag.name = tag_update_params.name
  tag.color = tag_update_params.color
  tag.last_use = datetime.datetime.now()
  db.commit()
  db.refresh(tag)
  return tag

def delete_tag(db: Session, tag_id: UUID):
  db.query(TagModel) \
    .filter(TagModel.id == tag_id) \
    .delete()
  db.commit()