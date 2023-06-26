import datetime
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, relationship, Session

from wugserver.database import Base
from wugserver.models.db.interaction_tag_association import (
    interaction_tag_association_table,
)
from wugserver.schema.tag import TagCreate


class TagModel(Base):
    __tablename__ = "tags"

    id = Column(Uuid, primary_key=True)
    creator_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name = Column(String(32))
    color = Column(String(7))
    interactions: Mapped[
        list["wugserver.models.db.interaction_model.InteractionRecord"]
    ] = relationship(
        secondary=interaction_tag_association_table,
        back_populates="tags",
    )
    last_use = Column(DateTime)


Index("last_use_composite_index", TagModel.creator_user_id, TagModel.last_use)


def get_tag_owner(db: Session, tag: TagModel):
    return tag.creator_user_id


def create_tag(db: Session, user_id: int, tag_create_params: TagCreate):
    # Enforce 0 constraint on db level
    # As a result, one user may reuse same name/color for multiple tags
    tag = TagModel(
        id=uuid4(),
        creator_user_id=user_id,
        name=tag_create_params.name,
        color=tag_create_params.color,
        last_use=datetime.datetime.utcnow(),
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def get_tags_by_user_id(db: Session, user_id: int):
    return (
        db.query(TagModel)
        .filter(TagModel.creator_user_id == user_id)
        .order_by(TagModel.last_use.desc())
        .all()
    )


def get_tag_by_id(db: Session, tag_id: UUID):
    return db.query(TagModel).filter(TagModel.id == tag_id).one_or_none()


def set_tag_update_time_and_commit(db: Session, tag: TagModel):
    tag.last_use = datetime.datetime.utcnow()
    db.commit()
    db.refresh(tag)
    return tag


def update_tag(db: Session, tag: TagModel, tag_update_params: TagCreate):
    tag.name = tag_update_params.name
    tag.color = tag_update_params.color
    return set_tag_update_time_and_commit(db=db, tag=tag)


def delete_tag(db: Session, tag: TagModel):
    db.delete(tag)
    db.commit()
