from collections import defaultdict

from sqlalchemy.orm import Session
from wugserver.constants import ENV, Environment, Provider, get_provider_by_name
from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.ai_models.echo_model import EchoModel
from wugserver.models.ai_models.openai_model import GPTModel, DALLET2IModel
from wugserver.models.ai_models.stable_diffusion_model import (
    StableDiffusionV3T2IModel,
    all_dreambooth_models,
)
from wugserver.models.api_key_model import ApiKeyModel

"""
ai_models.py: interface to access all AI models
"""

# Instantiates a singleton for each model class
# Initializes the list of available models
model_name_to_model: dict[str, AIModel] = {}
provider_to_model: dict[Provider, list[AIModel]] = defaultdict(list)
supported_models: list[AIModel] = [
    GPTModel(),
    DALLET2IModel(),
    StableDiffusionV3T2IModel(),
]
supported_models.extend(all_dreambooth_models())
if ENV != Environment.production:
    supported_models.append(EchoModel())

for model in supported_models:
    model_name_to_model.update({name: model for name in model.supported_model_names})
    provider_to_model[model.get_provider()].append(model)


def get_model_by_name(model_name: str) -> AIModel | None:
    return model_name_to_model.get(model_name, None)


def get_any_model_of_provider(provider: Provider) -> AIModel:
    # print(provider_to_model.keys())
    models = provider_to_model.get(provider, None)
    if not models:
        raise ValueError(f"Provider {provider} has no models")
    return models[0]


def get_user_available_models(
    user_id: int,
    api_key_model: ApiKeyModel,
):
    available_models = []
    api_keys: list[ApiKeyRecord] = api_key_model.get_all_api_keys(user_id=user_id)

    for api_key in api_keys:
        provider = get_provider_by_name(api_key.provider)
        models = provider_to_model.get(provider)
        if models is None:
            continue
        for model in models:
            supported_model_names = model.get_user_models_list(api_key.api_key)
            available_models.extend(supported_model_names)

    if ENV != Environment.production:
        available_models.append("echo")
    return available_models
