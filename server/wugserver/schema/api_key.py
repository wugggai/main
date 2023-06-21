from pydantic import BaseModel


class ApiKeyCreate(BaseModel):
    api_key: str


class ApiKeyBase(ApiKeyCreate):
    provider: str

    class Config:
        orm_mode = True
