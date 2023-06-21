from typing import List

from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.ai_models.echo_model import EchoModel
from wugserver.models.ai_models.openai_model import OpenAIModels

"""
ai_models.py: interface to access all AI models
"""

# Instantiates a singleton for each model class
# Initializes the list of available models
supported_models_name_to_model_class: dict[str, AIModel] = {}
supported_models: List[AIModel] = [OpenAIModels(), EchoModel()]

for model_cls in supported_models:
    supported_models_name_to_model_class.update(
        {name: model_cls for name in model_cls.model_names}
    )


def get_available_models_by_user_id(user_id: int) -> List[str]:
    # TODO: fetch list of available models from providers, filter by user accessibility
    # TODO: expose as API
    return supported_models_name_to_model_class.keys()


def get_model_by_name(model_name: str) -> AIModel | None:
    return supported_models_name_to_model_class.get(model_name, None)
