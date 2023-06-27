from sqlalchemy.orm import Session
from wugserver.constants import Environment, Provider, current_environment
from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.ai_models.echo_model import EchoModel
from wugserver.models.ai_models.openai_model import OpenAIModels
from wugserver.models.db.api_key_model import get_user_api_key_for_provider

"""
ai_models.py: interface to access all AI models
"""

# Instantiates a singleton for each model class
# Initializes the list of available models
supported_models_name_to_model_class: dict[str, AIModel] = {}
supported_models: list[AIModel] = [OpenAIModels(), EchoModel()]

for model_cls in supported_models:
    supported_models_name_to_model_class.update(
        {name: model_cls for name in model_cls.supported_model_names}
    )


def get_model_by_name(model_name: str) -> AIModel | None:
    return supported_models_name_to_model_class.get(model_name, None)


# This is not the most ideal way to implement this, but gets the feature out for now.
def get_user_available_models(db: Session, user_id: int):
    available_models = (
        [] if current_environment() == Environment.production else ["echo"]
    )
    openai_key = get_user_api_key_for_provider(db, user_id, Provider.openai)
    if openai_key:
        available_models += OpenAIModels.get_user_models_list(openai_key.api_key)
    return available_models
