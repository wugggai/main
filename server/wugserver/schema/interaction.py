from uuid import UUID
from pydantic import BaseModel

class InteractionCreate(BaseModel):
    title: str

class Interaction(InteractionCreate):
    id: UUID

    class Config:
        orm_mode = True
