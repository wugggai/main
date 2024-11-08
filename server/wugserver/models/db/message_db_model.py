import datetime
from uuid import UUID, uuid4
from fastapi import Depends

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, relationship, Session
from sqlalchemy.ext.hybrid import hybrid_property

from wugserver.database import Base
from wugserver.dependencies import get_db
from wugserver.models.db.message_favorite_db_model import MessageFavoriteRecord
from wugserver.models.db.message_content_db_model import MessageContentRecord
from wugserver.schema.message import MessageSegment


# TODO: Message table should store userId
class MessageRecord(Base):
    __tablename__ = "messages"

    id = Column(Uuid, primary_key=True)
    interaction_id = Column(
        Uuid, ForeignKey("interactions.id", ondelete="CASCADE"), index=True
    )
    source = Column(String(64))
    message: Mapped[list[MessageContentRecord]] = relationship("MessageContentRecord")
    offset = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow())
    favorites: Mapped[list[MessageFavoriteRecord]] = relationship(
        "MessageFavoriteRecord", back_populates="message"
    )

    @hybrid_property
    def favorite_by(self):
        return [favorite.user_id for favorite in self.favorites]


Index("offset_composite_index", MessageRecord.interaction_id, MessageRecord.offset)


class MessageDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_interaction_messages(
        self,
        interaction_id: UUID,
        offset: int,
        limit: int,
        from_latest: bool = True,
    ) -> list[MessageRecord]:
        query = None
        if from_latest:
            query = (
                self.db.query(MessageRecord)
                .filter(MessageRecord.interaction_id == interaction_id)
                .order_by(MessageRecord.offset.desc())
            )
        else:
            query = (
                self.db.query(MessageRecord)
                .filter(MessageRecord.interaction_id == interaction_id)
                .order_by(MessageRecord.offset.asc())
            )
        return query.limit(limit).offset(offset).all()

    def create_message(
        self, interaction_id: UUID, source: str, message: list[MessageSegment]
    ):
        offset = self._get_interaction_message_count(interaction_id)
        message_id = uuid4()
        message_content = [
            MessageContentRecord(
                message_id=message_id, type=m.type, content=m.content, order=index
            )
            for index, m in enumerate(message)
        ]
        message = MessageRecord(
            id=message_id,
            interaction_id=interaction_id,
            source=source,
            offset=offset,
            message=message_content,
            timestamp=datetime.datetime.utcnow(),
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def _get_interaction_message_count(self, interaction_id: UUID):
        return (
            self.db.query(MessageRecord)
            .filter(MessageRecord.interaction_id == interaction_id)
            .count()
        )
