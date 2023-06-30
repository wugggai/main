import openai

from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.db.api_key_model import ApiKeyModel
from wugserver.models.db.message_db_model import MessageRecord
from wugserver.schema.message import Message, MessageCreate
from wugserver.constants import Provider


class OpenAIModels(AIModel):
    supported_model_names = ["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4"]
    provider = Provider.openai

    def post_message(
        self,
        api_key: ApiKeyModel,
        interaction_context: list[MessageRecord],
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
            response = openai.ChatCompletion.create(
                api_key=api_key.api_key,
                model=message_create_params.model,
                messages=previous_messages,
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
            if message.source in OpenAIModels.supported_model_names
            else "user",
            "content": message.message,
        }

    def get_user_models_list(key: str):
        try:
            response = openai.Model.list(api_key=key)
            print(response)
            api_supported_models = [model["id"] for model in response["data"]]
            return [
                model
                for model in OpenAIModels.supported_model_names
                if model in api_supported_models
            ]
        # As of 6/15/2023, OpenAI documentation does not specify possible errors returned by the API
        except Exception as e:
            raise e
