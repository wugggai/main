from sqlalchemy.orm import Session

from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.db.message_db_model import MessageRecord
from wugserver.schema.message import MessageCreate, MessageSegment, MessageTypes
from wugserver.constants import Provider

"""
A dummy model which accepts a single user message in text and repeats it
Internal testing only
"""


class EchoModel(AIModel):
    supported_model_names = ["echo"]
    provider = Provider.none

    @classmethod
    def assert_input_format(cls, message_create_params: MessageCreate):
        if len(message_create_params.message) < 1:
            raise ValueError("echo model requires at least one input message")

    def post_message(
        self,
        api_key: str,
        interaction_context: list[MessageRecord],
        message_create_params: MessageCreate,
    ):
        current_messages_count = len(interaction_context)
        message = message_create_params.message

        return self.wrap_text_message(
            f"You just created Message #{current_messages_count} in an interaction. "
            f"The message contains {len(message)} segment(s). "
            f'First segment has type {message[0].type.value} and content: "{message[0].content}". '
            f"This response message is Message #{current_messages_count + 1}."
        )

    # EchoModel does not require an API key
    def get_user_api_key(self, db: Session, user_id: int):
        return "key"

    @classmethod
    def requires_context(cls) -> bool:
        return True
