import datetime
from fastapi import Depends
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, relationship, Session
from uuid import UUID, uuid4

from wugserver.database import Base
from wugserver.dependencies import get_db
from wugserver.models.db.interaction_tag_association import (
    interaction_tag_association_table,
)
from wugserver.schema.tag import TagCreate


class TagRecord(Base):
    __tablename__ = "tags"

    id = Column(Uuid, primary_key=True)
    creator_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name = Column(String(32))
    color = Column(String(7))
    interactions: Mapped[
        list["wugserver.models.db.interaction_db_model.InteractionRecord"]
    ] = relationship(
        secondary=interaction_tag_association_table,
        back_populates="tags",
    )
    last_use = Column(DateTime)


Index("last_use_composite_index", TagRecord.creator_user_id, TagRecord.last_use)


class TagDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_tag_owner(self, tag: TagRecord):
        return tag.creator_user_id

    def create_tag(self, user_id: int, tag_create_params: TagCreate):
        # Enforce 0 constraint on db level
        # As a result, one user may reuse same name/color for multiple tags
        tag = TagRecord(
            id=uuid4(),
            creator_user_id=user_id,
            name=tag_create_params.name,
            color=tag_create_params.color,
            last_use=datetime.datetime.utcnow(),
        )
        self.db.add(tag)
        self.db.commit()
        self.db.refresh(tag)
        return tag

    def get_tags_by_user_id(self, user_id: int):
        return (
            self.db.query(TagRecord)
            .filter(TagRecord.creator_user_id == user_id)
            .order_by(TagRecord.last_use.desc())
            .all()
    )

    def get_tag_by_name(self, user_id: int, name: str):
        filters = [
            TagRecord.creator_user_id == user_id,
            TagRecord.name == name,
        ]
        return (
            self.db.query(TagRecord)
            .filter(*filters)
            .one_or_none()
        )

    def get_tag_by_id(self, tag_id: UUID):
        return self.db.query(TagRecord).filter(TagRecord.id == tag_id).one_or_none()

    def set_tag_update_time_and_commit(self, tag: TagRecord):
        tag.last_use = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(tag)
        return tag

    def update_tag(self, tag: TagRecord, tag_update_params: TagCreate):
        tag.name = tag_update_params.name
        tag.color = tag_update_params.color
        return self.set_tag_update_time_and_commit(tag=tag)

    def delete_tag(self, tag: TagRecord):
        self.db.delete(tag)
        self.db.commit()
