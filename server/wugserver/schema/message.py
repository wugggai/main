
from uuid import UUID
from pydantic import BaseModel

class MessageCreate(BaseModel):
    content: str
  
class Message(MessageCreate):
    role: str
    id: UUID
    interactionId: UUID

    class Config:
        orm_mode = True