from enum import Enum
from pydantic import BaseModel
from wugserver.schema.message import MessageTypes

class PromptTypes(Enum):
    chat = "chat"
    text_to_image = "text_to_image"

class Prompt(BaseModel):
    prompt: str
