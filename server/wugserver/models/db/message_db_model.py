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


# TODO: Message table should store userId
class MessageRecord(Base):
    __tablename__ = "messages"

    id = Column(Uuid, primary_key=True)
    interaction_id = Column(
        Uuid, ForeignKey("interactions.id", ondelete="CASCADE"), index=True
    )
    source = Column(String(64))
    message: Mapped[list[MessageContentRecord]] = relationship(
        "MessageContentRecord", back_populates="messages"
    )
    offset = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow())
    favorites: Mapped[list[MessageFavoriteRecord]] = relationship(
        "MessageFavoriteRecord", back_populates="messages"
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

    def create_message_content_record(self, type: str, content: str, order: int):
        try:
            _type = MessageContentTypes[type]
        except e:
            raise ValueError(f"{type} content type is not supported")
        message_content_record = MessageContentRecord(
            type=type,
            content=content,
            order=order,
        )
        self.db.add(message_content_record)
        self.db.commit()
        self.db.refresh(message_content_record)
        return message_content_record

    def create_message(self, interaction_id: UUID, source: str, message_content: list[MessageContentRecord]):
        offset = self._get_interaction_message_count(interaction_id)
        message = MessageRecord(
            id=uuid4(),
            interaction_id=interaction_id,
            source=source,
            message=message_content,
            offset=offset,
            timestamp=datetime.datetime.utcnow(),
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def _get_interaction_message_count(self, interaction_id: UUID):
        last_message = self.db.query(MessageRecord) \
            .filter(MessageRecord.interaction_id == interaction_id) \
            .order_by(MessageRecord.offset.desc()) \
            .limit(1)
        return last_message.offset + 1
