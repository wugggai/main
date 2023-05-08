from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from wugserver.schema.message import Message
from wugserver.schema.tag import Tag

class InteractionCreate(BaseModel):
    title: str

class Interaction(InteractionCreate):
    id: UUID
    creator_user_id: UUID
    class Config:
        orm_mode = True

class InteractionUpdate(BaseModel):
    title: str
    tag_ids: list[UUID]

class InteractionGetAllResponse(BaseModel):
    id: UUID
    title: str
    tag_ids: list[UUID]
    last_updated: datetime
    last_message: Optional[Message]
