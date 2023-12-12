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
from wugserver.models.db.tag_db_model import TagDbModel, TagRecord
from wugserver.schema.tag import TagCreate

class TagModel:
    def __init__(self, tag_db_model: TagDbModel = Depends(TagDbModel)):
        self.tag_db_model = tag_db_model

    def get_tag_owner(self, tag: TagRecord):
        return self.tag_db_model.get_tag_owner(tag)

    def create_tag(self, user_id: int, tag_create_params: TagCreate):
        return self.tag_db_model.create_tag(
            user_id,
            tag_create_params,
        )

    def get_tags_by_user_id(self, user_id: int):
        return self.tag_db_model.get_tags_by_user_id(user_id)

    def get_tag_by_id(self, tag_id: UUID):
        return self.tag_db_model.get_tag_by_id(tag_id)

    def set_tag_update_time(self, tag: TagRecord):
        return self.tag_db_model.set_tag_update_time_and_commit(tag)

    def update_tag(self, tag: TagRecord, tag_update_params: TagCreate):
        return self.tag_db_model.update_tag(
            tag,
            tag_update_params,
        )

    def delete_tag(self, tag: TagRecord):
        return self.tag_db_model.delete_tag(tag)
