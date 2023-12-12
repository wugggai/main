import datetime
from fastapi import Depends
from wugserver.database import Base
from wugserver.dependencies import get_db
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Uuid,
)
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, relationship, Session
from uuid import UUID, uuid4
from wugserver.models.db.interaction_tag_association import (
    interaction_tag_association_table,
)
from wugserver.models.db.interaction_db_model import InteractionDbModel, InteractionRecord
from wugserver.models.db.tag_db_model import TagRecord, TagDbModel
from wugserver.schema.interaction import InteractionCreate, InteractionUpdate


class InteractionModel:

    def __init__(
        self,
        interaction_db_model: InteractionDbModel = Depends(InteractionDbModel),
        tag_db_model: TagDbModel = Depends(TagDbModel)
    ):
        self.interaction_db_model = interaction_db_model
        self.tag_db_model = tag_db_model

    def get_interaction_owner(self, interaction: InteractionRecord):
        return self.interaction_db_model.get_interaction_owner(interaction)

    def create_interaction(
        self,
        creator_user_id: UUID,
        interaction_create_params: InteractionCreate,
        auto_title: str,
    ):
        return self.interaction_db_model.create_interaction(
            creator_user_id,
            interaction_create_params,
            auto_title
        )
    
    def set_interaction_update_time(self, interaction: InteractionRecord):
        return self.interaction_db_model.set_interaction_update_time_and_commit(interaction)

    def get_interaction_by_id(
        self,
        interaction_id: UUID,
        include_deleted: bool = False
    ) -> InteractionRecord | None:
        return self.interaction_db_model.get_interaction_by_id(
            interaction_id,
            include_deleted,
        )

    def get_interactions_by_creator_user_id(
        self,
        creator_user_id: int,
        limit: int,
        offset: int,
        include_deleted: bool = False,
    ):
        return self.interaction_db_model.get_interactions_by_creator_user_id(
            creator_user_id,
            limit,
            offset,
            include_deleted,
        )

    def get_deleted_interactions_by_creator_user_id(
        self,
        creator_user_id: int,
        limit: int,
        offset: int,
    ):
        return self.interaction_db_model.get_deleted_interactions_by_creator_user_id(
            creator_user_id,
            limit,
            offset,
        )

    def update_interaction(
        self,
        interaction: InteractionRecord,
        tags: list[TagRecord] | None,
        title: str | None,
        deleted: bool | None,
    ):
        if tags is not None:
            for tag in tags:
                self.tag_db_model.set_tag_update_time_and_commit(tag)
        return self.interaction_db_model.update_interaction(
            interaction,
            tags,
            title,
            deleted,
        )

    def delete_interaction(
        self, interaction_id: UUID,
    ):
        return self.interaction_db_model.delete_interaction(interaction_id)
