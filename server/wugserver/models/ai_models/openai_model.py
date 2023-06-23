from typing import List

import openai

from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.db.api_key_model import ApiKeyModel
from wugserver.models.db.message_db_model import MessageRecord
from wugserver.schema.message import Message, MessageCreate
from wugserver.constants import Provider


class OpenAIModels(AIModel):
    model_names = ["gpt-3.5-turbo"]
    provider = Provider.openai

    def post_message(
        self,
        api_key: ApiKeyModel,
        interaction_context: List[MessageRecord],
        message_create_params: MessageCreate,
    ):
        previous_messages = [
            OpenAIModels.to_openai_message(m) for m in interaction_context
        ]
        previous_messages.append(
            OpenAIModels.new_user_openai_message(message_create_params.message)
        )

        # As of 4/29/2023 GPT3.5 doesn't accept parameters. Disregard messageCreateParams.model_config
        try:
            openai.api_key = api_key.api_key
            response = openai.ChatCompletion.create(
                model=message_create_params.model, messages=previous_messages
            )
            return response["choices"][0]["message"]["content"]
        # As of 6/15/2023, OpenAI documentation does not specify possible errors returned by the API
        except Exception as e:
            raise e

    def new_user_openai_message(message: str):
        return {"role": "user", "content": message}

    def to_openai_message(message: Message):
        return {
            "role": "assistant"
            if message.source in OpenAIModels.model_names
            else "user",
            "content": message.message,
        }
