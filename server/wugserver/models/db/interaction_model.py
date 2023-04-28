import datetime
from wugserver.database import Base
from sqlalchemy import Column, DateTime, String, Uuid
from sqlalchemy.orm import Session
from uuid import UUID, uuid4

from wugserver.schema.interaction import InteractionCreate

class InteractionModel(Base):
    __tablename__ = "interactions"

    id = Column(Uuid, primary_key=True)
    creatorUserId = Column(Uuid, index=True)
    title = Column(String)
    created = Column(DateTime)
    updated = Column(DateTime)

def create_interaction(db: Session, creatorUserId: UUID, interactionCreate: InteractionCreate):
    interaction = InteractionModel(id=uuid4(), creatorUserId=creatorUserId, title=interactionCreate.title, created=datetime.datetime.now(), updated=datetime.datetime.now())
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction

def get_interaction_by_id(db: Session, interactionId: UUID):
    return db.query(InteractionModel).filter(InteractionModel.id == interactionId).first()

def get_interactions_by_creator_user_id(db: Session, creatorUserId: UUID):
    # TODO: actually filter by user id
    return db.query(InteractionModel).limit(10).all()