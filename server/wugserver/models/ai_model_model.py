from collections import defaultdict

from sqlalchemy.orm import Session
from wugserver.constants import ENV, Environment, Provider
from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.ai_models.echo_model import EchoModel
from wugserver.models.ai_models.openai_model import GPTModel, DALLEModel
from wugserver.models.db.api_key_model import ApiKeyModel, get_all_user_api_keys

"""
ai_models.py: interface to access all AI models
"""

# Instantiates a singleton for each model class
# Initializes the list of available models
model_name_to_model: dict[str, AIModel] = {}
provider_to_model: dict[Provider, list[AIModel]] = defaultdict(list)
supported_models: list[AIModel] = [GPTModel(), DALLEModel(), EchoModel()]

for model in supported_models:
    model_name_to_model.update({name: model for name in model.supported_model_names})
    provider_to_model[model.get_provider()].append(model)


def get_model_by_name(model_name: str) -> AIModel | None:
    return model_name_to_model.get(model_name, None)


def get_user_available_models(db: Session, user_id: int):
    available_models = []
    api_keys: list[ApiKeyModel] = get_all_user_api_keys(db=db, user_id=user_id)

    for api_key in api_keys:
        try:
            provider = Provider[api_key.provider]
        except KeyError:
            raise ValueError(f"Provider {provider} is no longer supported.")
        models = provider_to_model.get(provider)
        if models is None:
            continue
        for model in models:
            supported_model_names = model.get_user_models_list(api_key.api_key)
            available_models.extend(supported_model_names)

    if ENV != Environment.production:
        available_models.append("echo")
    return available_models
