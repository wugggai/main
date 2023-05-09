from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from wugserver.schema.message import Message, MessageCreate
from wugserver.schema.tag import Tag

class InteractionCreate(BaseModel):
    title: Optional[str]
    initialMessage: Optional[MessageCreate]

class Interaction(BaseModel):
    id: UUID
    title: Optional[str]
    tag_ids: list[UUID]
    last_updated: datetime
    creator_user_id: int
    class Config:
        orm_mode = True

class InteractionUpdate(BaseModel):
    title: str
    tag_ids: list[UUID]

class InteractionWithLatestMessage(BaseModel):
    interaction: Interaction
    last_message: Optional[Message]
