from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: Optional[str]


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True
