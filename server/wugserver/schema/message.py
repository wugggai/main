from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


# TODO: messageCreate should capture the userId too
class MessageCreate(BaseModel):
    message: str
    model: str = Field(default="echo")
    model_config: dict


class Message(BaseModel):
    id: UUID
    message: str
    interaction_id: UUID
    source: str
    message: str
    offset: int
    timestamp: datetime
    favorite_by: list[int]

    class Config:
        orm_mode = True
