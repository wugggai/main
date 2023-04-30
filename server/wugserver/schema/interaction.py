from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from wugserver.schema.message import Message

class InteractionCreate(BaseModel):
    creatorUserId: UUID
    title: str

class Interaction(InteractionCreate):
    id: UUID
    class Config:
        orm_mode = True

class InteractionGetAllResponse(BaseModel):
    id: UUID
    title: str
    last_updated: datetime
    last_message: Optional[Message]
