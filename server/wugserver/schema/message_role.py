from enum import Enum

class MessageRole(str, Enum):
    user = "user"
    system = "system"