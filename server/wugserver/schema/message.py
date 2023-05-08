from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID

# TODO: messageCreate should capture the userId too
class MessageCreate(BaseModel):
    message: str
    model: str = Field(default='echo')
    model_config: dict

class Message(BaseModel):
    message: str
    id: UUID
    interaction_id: UUID
    source: str
    message: str
    offset: int
    timestamp: datetime

    class Config:
        orm_mode = True
