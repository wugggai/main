from fastapi import Depends

from wugserver.models.db.api_key_db_model import ApiKeyRecord, ApiKeyDbModel
from wugserver.schema.api_key import ApiKeyBase, ApiKeyCreate


class ApiKeyModel:
    def __init__(
        self,
        api_key_db_model: ApiKeyDbModel = Depends(ApiKeyDbModel),
    ):
        self.api_key_db_model = api_key_db_model

    # obfuscate_api_key turns ApiKeyRecord into ApiKeyBase
    def obfuscate_api_key_record(self, record: ApiKeyRecord):
        key = record.api_key
        if key is not None and len(key) > 12:
            key = key[:8] + "*" * (len(key) - 12) + key[-4:]
        return ApiKeyBase(
            provider=record.provider,
            api_key=key,
        )

    def create_api_key(
        self,
        user_id: int,
        provider: str,
        api_key: ApiKeyCreate,
    ) -> ApiKeyBase:
        return self.api_key_db_model.create_api_key(
            user_id=user_id,
            provider=provider,
            key=api_key.api_key,
        )

    def update_api_key(
        self,
        user_id: int,
        provider: str,
        api_key: ApiKeyCreate,
    ) -> ApiKeyBase:
        return self.api_key_db_model.update_api_key(
            user_id=user_id, provider=provider, key=api_key.api_key
        )

    def get_api_key_by_provider(
        self,
        user_id: int,
        provider: str,
    ) -> ApiKeyBase:
        return self.api_key_db_model.get_api_key_by_provider(
            user_id=user_id,
            provider=provider,
        )

    def get_all_api_keys(
        self,
        user_id: int,
    ) -> list[ApiKeyBase]:
        return self.api_key_db_model.get_all_api_keys(user_id=user_id)
