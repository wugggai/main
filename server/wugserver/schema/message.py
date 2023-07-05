from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
from uuid import UUID


class MessageTypes(Enum):
    text = "text"
    image_url = "image_url"


class MessageSegment(BaseModel):
    type: MessageTypes
    content: str


class MessageCreate(BaseModel):
    message: list[MessageSegment]
    model: str = Field(default="echo")
    model_config: dict


class Message(BaseModel):
    id: UUID
    message: list[MessageSegment]
    interaction_id: UUID
    source: str
    offset: int
    timestamp: datetime
    favorite_by: list[int]

    class Config:
        orm_mode = True
