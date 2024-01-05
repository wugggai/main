from enum import Enum
from pydantic import BaseModel


class PromptTypes(Enum):
    chat = "chat"
    text_to_image = "text_to_image"


class Prompt(BaseModel):
    content: str
