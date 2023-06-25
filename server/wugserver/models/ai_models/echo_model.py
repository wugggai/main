from sqlalchemy.orm import Session

from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.db.message_db_model import MessageRecord
from wugserver.schema.message import MessageCreate
from wugserver.constants import Provider

"""
A dummy model which accepts a single user message in text and repeats it
Internal testing only
"""


class EchoModel(AIModel):
    model_names = ["echo"]
    provider = Provider.none

    def post_message(
        self,
        api_key: str,
        interaction_context: list[MessageRecord],
        message_create_params: MessageCreate,
    ):
        current_messages_count = len(interaction_context)

        return (
            f"You just created Message #{current_messages_count} "
            f"in an interaction with {current_messages_count} messages. "
            f'The message was: "{message_create_params.message}". '
            f"This response message is Message #{current_messages_count + 1}."
        )

    # EchoModel does not require an API key
    def get_user_api_key(self, db: Session, user_id: int):
        return "key"
