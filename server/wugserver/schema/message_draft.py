from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class MessageDraftCreate(BaseModel):
    draft: str


class MessageDraft(MessageDraftCreate):
    draft: str
    id: UUID
    modified: datetime

    class Config:
        orm_mode = True
