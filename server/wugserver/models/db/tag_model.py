import datetime
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, relationship, Session
from typing import List

from wugserver.database import Base
from wugserver.models.db.authorization import authorize_by_res_owner_id, authorize_get_tag_from_db, \
  authorize_get_tags_from_db
from wugserver.models.db.interaction_tag_association import interaction_tag_association_table
from wugserver.schema.tag import TagCreate

class TagModel(Base):
  __tablename__ = "tags"

  id = Column(Uuid, primary_key=True)
  creator_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
  name = Column(String)
  color = Column(String(7))
  interactions: Mapped[list['wugserver.models.db.interaction_model.InteractionModel']] = relationship(
    secondary=interaction_tag_association_table,
    back_populates="tags",
  )
  last_use = Column(DateTime)

Index("last_use_composite_index", TagModel.creator_user_id, TagModel.last_use)

@authorize_by_res_owner_id
def create_tag(db: Session, user_id: int, tag_create_params: TagCreate):
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

@authorize_by_res_owner_id
def get_tags_by_user_id(db: Session, user_id: int):
  return db.query(TagModel) \
    .filter(TagModel.creator_user_id == user_id) \
    .order_by(TagModel.last_use.desc()) \
    .all()

@authorize_get_tag_from_db
def get_tag_by_id(db: Session, tag_id: UUID):
  return db.query(TagModel) \
    .filter(TagModel.id == tag_id) \
    .one()

@authorize_get_tags_from_db
def get_tags_by_ids(db: Session, tag_ids: List[UUID]):
  return db.query(TagModel) \
    .filter(TagModel.id.in_(tag_ids)) \
    .all()

def update_tag(db: Session, current_user_id: int, tag_id: UUID, tag_update_params: TagCreate):
  tag = get_tag_by_id(db=db, current_user_id=current_user_id, tag_id=tag_id)
  tag.name = tag_update_params.name
  tag.color = tag_update_params.color
  tag.last_use = datetime.datetime.now()
  db.commit()
  db.refresh(tag)
  return tag

def delete_tag(db: Session, current_user_id: int, tag_id: UUID):
  # must use an authorized helper func
  tag = get_tag_by_id(db=db, current_user_id=current_user_id, tag_id=tag_id)
  if tag:
    db.delete(tag)
    db.commit()
