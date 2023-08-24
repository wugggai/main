from pydantic import BaseModel


class Model(BaseModel):
    name: str
    via_system_key: bool


class ModelList(BaseModel):
    model_names: list[Model]
