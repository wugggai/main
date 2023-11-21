from pydantic import BaseModel, validator
from typing import Optional
from wugserver.types.validators.email_validator import normalize_email
from wugserver.types.validators.password_validator import is_valid_password


class UserBase(BaseModel):
    email: str

    @validator("email", each_item=True)
    def check_email(cls, email):
        if email:
            return normalize_email(email)


class UserCreate(UserBase):
    password: Optional[str]

    @validator("password", each_item=True)
    def check_new_password(cls, pwd):
        if pwd:
            assert is_valid_password(pwd), f"{pwd} did not meet requirements"
            return pwd


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True
