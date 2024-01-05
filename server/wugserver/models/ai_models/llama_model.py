from llamaapi import LlamaAPI

from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.db.message_db_model import MessageRecord
from wugserver.schema.message import (
    Message,
    MessageCreate,
    MessageSegment,
    MessageTypes,
)
from wugserver.constants import Provider


class LlamaModel(AIModel):
    provider = Provider.llama
    supported_model_names = ["llama"]

    @classmethod
    def get_user_models_list(cls, key: str):
        return cls.supported_model_names

    @classmethod
    def get_user_verification_model(cls, key: str):
        return cls.supported_model_names[0]

    @classmethod
    def requires_context(cls) -> bool:
        return True

    @classmethod
    def assert_input_format(cls, message_create_params: MessageCreate):
        message = message_create_params.message
        if len(message) != 1 or message[0].type != MessageTypes.text:
            raise ValueError("Llama model requires a single text input prompt")

    def post_message(
        self,
        api_key: str,
        interaction_context: list[MessageRecord],
        message_create_params: MessageCreate,
    ):
        previous_messages = [self.to_llama_message(m) for m in interaction_context]
        previous_messages.append(
            self.new_user_llama_message(message_create_params.message[0].content)
        )

        llama_api = LlamaAPI(api_key)

        # As of 11/11/2023 llama doesn't accept parameters. Disregard messageCreateParams.model_config
        response = llama_api.run(
            {
                "messages": previous_messages,
                "stream": False,
            }
        )
        return self.wrap_text_message(
            response.json()["choices"][0]["message"]["content"]
        )

    def new_user_llama_message(self, message: str):
        return {"role": "user", "content": message}

    def to_llama_message(self, message: Message):
        return {
            "role": "assistant"
            if message.source in self.supported_model_names
            else "user",
            "content": "".join(
                [
                    segment.content
                    for segment in message.message
                    if segment.type == MessageTypes.text
                ]
            ),
        }
