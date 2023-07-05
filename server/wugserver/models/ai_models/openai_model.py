import openai

from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.db.api_key_model import ApiKeyModel
from wugserver.models.db.message_db_model import MessageRecord
from wugserver.schema.message import (
    Message,
    MessageCreate,
    MessageSegment,
    MessageTypes,
)
from wugserver.constants import Provider


class OpenAIModel(AIModel):
    provider = Provider.openai


class GPTModel(OpenAIModel):
    supported_model_names = ["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4"]

    @classmethod
    def get_user_models_list(cls, key: str):
        response = openai.Model.list(api_key=key)
        api_supported_models = [model["id"] for model in response["data"]]
        return [
            model
            for model in cls.supported_model_names
            if model in api_supported_models
        ]

    @classmethod
    def requires_context(cls) -> bool:
        return True

    @classmethod
    def assert_input_format(cls, message: list[MessageSegment]):
        if len(message) != 1 or message[0].type != MessageTypes.text:
            raise ValueError("GPT model requires a single text input prompt")

    def post_message(
        self,
        api_key: ApiKeyModel,
        interaction_context: list[MessageRecord],
        message_create_params: MessageCreate,
    ):
        previous_messages = [self.to_openai_message(m) for m in interaction_context]
        previous_messages.append(
            self.new_user_openai_message(message_create_params.message[0].content)
        )

        # As of 4/29/2023 GPT3.5 doesn't accept parameters. Disregard messageCreateParams.model_config
        response = openai.ChatCompletion.create(
            api_key=api_key.api_key,
            model=message_create_params.model,
            messages=previous_messages,
        )
        return self.wrap_text_message(response["choices"][0]["message"]["content"])

    def new_user_openai_message(self, message: str):
        return {"role": "user", "content": message}

    def to_openai_message(self, message: Message):
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


class DALLEModel(OpenAIModel):
    supported_model_names = ["DALL-E2"]

    @classmethod
    def assert_input_format(cls, message: list[MessageSegment]):
        if len(message) != 1 or message[0].type != MessageTypes.text:
            raise ValueError("DALL-E model requires a single text input prompt")

    @classmethod
    def get_user_models_list(cls, key: str):
        # The OpenAI image API doesn't require user to specify model
        return cls.supported_model_names

    def post_message(
        self,
        api_key: ApiKeyModel,
        message_create_params: MessageCreate,
        interaction_context=None,
    ):
        prompt = message_create_params.message[0].content
        response = openai.Image.create(
            api_key=api_key.api_key,
            prompt=prompt,
            n=1,
        )
        return self.wrap_image_message(response["data"][0]["url"])
