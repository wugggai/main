from sqlalchemy.orm import Session

from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.db.message_db_model import MessageRecord
from wugserver.schema.message import MessageCreate, MultiMediaContent
from wugserver.constants import Provider

"""
A dummy model which accepts a single user message in text and repeats it
Internal testing only
"""


class EchoModel(AIModel):
    supported_model_names = ["echo"]
    provider = Provider.none

    @classmethod
    def assert_input_format(message: list[MultiMediaContent]):
        if len(message) != 1 or message[0].type != "text":
            raise ValueError("echo model requires a single text input message")

    def post_message(
        self,
        api_key: str,
        interaction_context: list[MessageRecord],
        message_create_params: MessageCreate,
    ):
        current_messages_count = len(interaction_context)

        return self.wrap_text_message(
            f"You just created Message #{current_messages_count} "
            f"in an interaction with {current_messages_count} messages. "
            f'The message was: "{message_create_params.message[0].content}". '
            f"This response message is Message #{current_messages_count + 1}."
        )

    # EchoModel does not require an API key
    def get_user_api_key(self, db: Session, user_id: int):
        return "key"

    @classmethod
    def requires_context(cls) -> bool:
        return True
