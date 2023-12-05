from collections import defaultdict, namedtuple

from sqlalchemy.orm import Session
from wugserver.constants import ENV, Environment, Provider, get_provider_by_name
from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.ai_models.echo_model import EchoModel
from wugserver.models.ai_models.llama_model import LlamaModel
from wugserver.models.ai_models.openai_model import GPTModel, DALLET2IModel
from wugserver.models.ai_models.stable_diffusion_model import (
    StableDiffusionV3T2IModel,
    all_dreambooth_models,
)
from wugserver.models.api_key_model import ApiKeyModel
from wugserver.models.db.api_key_db_model import ApiKeyRecord
from wugserver.models.db.system_key_db_model import SystemKeyRecord
from wugserver.models.db.system_key_usage_db_model import SystemKeyUsageDbModel
from wugserver.models.system_key_model import SystemKeyModel
from wugserver.models.system_key_usage_mdoel import SystemKeyUsageModel
from wugserver.schema.model_list import Model

"""
ai_models.py: interface to access all AI models
"""

# Instantiates a singleton for each model class
# Initializes the list of available models
model_name_to_model: dict[str, AIModel] = {}
provider_to_model: dict[Provider, list[AIModel]] = defaultdict(list)
supported_models: list[AIModel] = [
    GPTModel(),
    LlamaModel(),
    DALLET2IModel(),
    StableDiffusionV3T2IModel(),
]
supported_models.extend(all_dreambooth_models())
Key = namedtuple("Key", "provider key")

if ENV != Environment.production:
    supported_models.append(EchoModel())

for model in supported_models:
    model_name_to_model.update({name: model for name in model.supported_model_names})
    provider_to_model[model.get_provider()].append(model)


def get_model_by_name(model_name: str) -> AIModel | None:
    return model_name_to_model.get(model_name, None)


def get_any_model_of_provider(provider: Provider) -> AIModel:
    models = provider_to_model.get(provider, None)
    if not models:
        raise ValueError(f"Provider {provider} has no models")
    return models[0]


def _get_model_list_from_providers(keys: list[Key], is_system_key: bool) -> list[Model]:
    available_models: list[Model] = []
    for key in keys:
        provider = get_provider_by_name(key.provider)
        models = provider_to_model.get(provider)
        if models is None:
            continue
        for model in models:
            supported_model_names = model.get_user_models_list(key.key)
            uses_context = model.requires_context()
            available_models.extend(
                [
                    Model(name=name, uses_context=uses_context, via_system_key=is_system_key)
                    for name in supported_model_names
                ]
            )
    return available_models


def get_user_available_models(
    user_id: int,
    api_key_model: ApiKeyModel,
    system_key_model: SystemKeyModel,
    system_key_usage_model: SystemKeyUsageModel,
) -> list[Model]:
    available_models: list[Model] = []

    api_keys: list[ApiKeyRecord] = api_key_model.get_all_api_keys(user_id=user_id)
    available_models.extend(
        _get_model_list_from_providers(
            [Key(key.provider, key.api_key) for key in api_keys], False
        )
    )

    all_system_keys: list[SystemKeyRecord] = system_key_model.get_all_system_keys()
    system_keys_available_for_user = [
        key
        for key in all_system_keys
        if system_key_usage_model.user_can_user_system_key(
            user_id=user_id, provider=key.provider, limit=key.limit
        )
    ]
    available_models.extend(
        _get_model_list_from_providers(
            [Key(key.provider, key.key) for key in system_keys_available_for_user], True
        )
    )

    if ENV != Environment.production:
        available_models.append(Model(name="echo", uses_context=True, via_system_key=False))
    return available_models
