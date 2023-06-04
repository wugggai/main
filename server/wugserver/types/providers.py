from enum import Enum

class Provider(str, Enum):
    openai = "openai"
    none = "none"