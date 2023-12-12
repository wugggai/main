import datetime
from fastapi import Depends
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

from wugserver.database import Base
from wugserver.dependencies import get_db
from wugserver.models.db.interaction_tag_association import (
    interaction_tag_association_table,
)
from wugserver.models.db.tag_db_model import TagRecord
from wugserver.schema.interaction import InteractionCreate, InteractionUpdate


class InteractionRecord(Base):
    __tablename__ = "interactions"

    id = Column(Uuid, primary_key=True)
    creator_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title = Column(String(256))
    tags: Mapped[list[TagRecord]] = relationship(
        secondary=interaction_tag_association_table,
        back_populates="interactions",
    )
    last_updated = Column(DateTime)
    deleted = Column(Boolean, default=False)

    @hybrid_property
    def tag_ids(self):
        return [tag.id for tag in self.tags]


Index(
    "last_updated_composite_index",
    InteractionRecord.creator_user_id,
    InteractionRecord.last_updated,
)


class InteractionDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_interaction_owner(self, interaction: InteractionRecord):
        return interaction.creator_user_id

    def create_interaction(
        self,
        creator_user_id: UUID,
        interaction_create_params: InteractionCreate,
        auto_title: str,
    ):
        interaction = InteractionRecord(
            id=uuid4(),
            creator_user_id=creator_user_id,
            title=interaction_create_params.title or auto_title,
            last_updated=datetime.datetime.utcnow(),
        )
        self.db.add(interaction)
        self.db.commit()
        self.db.refresh(interaction)
        return interaction

    def set_interaction_update_time_and_commit(
        self, interaction: InteractionRecord
    ):
        interaction.last_updated = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(interaction)
        return interaction

    def get_interaction_by_id(
        self, interaction_id: UUID, include_deleted: bool = False
    ) -> InteractionRecord | None:
        filters = [InteractionRecord.id == interaction_id]
        if not include_deleted:
            filters.append(InteractionRecord.deleted == False)

        return self.db.query(InteractionRecord).filter(*filters).one_or_none()

    def get_interactions_by_creator_user_id(
        self,
        creator_user_id: int,
        limit: int,
        offset: int,
        include_deleted: bool = False,
    ):
        filters = [InteractionRecord.creator_user_id == creator_user_id]
        if not include_deleted:
            filters.append(InteractionRecord.deleted == False)

        return (
            self.db.query(InteractionRecord)
            .filter(*filters)
            .order_by(InteractionRecord.last_updated.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    def get_deleted_interactions_by_creator_user_id(
        self, creator_user_id: int, limit: int, offset: int
    ):
        filters = [
            InteractionRecord.creator_user_id == creator_user_id,
            InteractionRecord.deleted == True,
        ]
        return (
            self.db.query(InteractionRecord)
            .filter(*filters)
            .order_by(InteractionRecord.last_updated.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    def update_interaction(
        self,
        interaction: InteractionRecord,
        tags: list[TagRecord] | None,
        title: str | None,
        deleted: bool | None,
    ):
        if tags is not None:
            interaction.tags = tags
        if title is not None:
            interaction.title = title
        if deleted is not None:
            interaction.deleted = deleted
        return self.set_interaction_update_time_and_commit(interaction)

    def delete_interaction(self, interaction_id: UUID):
        to_delete = (
            self.db.query(InteractionRecord)
            .filter(InteractionRecord.id == interaction_id)
            .delete()
        )
        self.db.flush()
        self.db.commit()
        return to_delete
