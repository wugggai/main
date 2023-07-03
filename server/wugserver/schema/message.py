from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


class MessageSegment(BaseModel):
    type: str
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
