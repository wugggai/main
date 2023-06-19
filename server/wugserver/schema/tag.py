from datetime import datetime
from pydantic import BaseModel, constr
from uuid import UUID


class TagCreate(BaseModel):
    name: str
    color: constr(min_length=6, max_length=7)


class Tag(TagCreate):
    id: UUID
    last_use: datetime

    class Config:
        orm_mode = True
