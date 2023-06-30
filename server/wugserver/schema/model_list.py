from pydantic import BaseModel


class ModelList(BaseModel):
    model_names: list[str]
