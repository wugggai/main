from fastapi import Depends

from wugserver.models.db.system_key_db_model import SystemKeyDbModel, SystemKeyRecord


class SystemKeyModel:
    def __init__(
        self,
        system_key_model: SystemKeyDbModel = Depends(SystemKeyDbModel),
    ):
        self.system_key_model = system_key_model

    def get_system_key_by_provider(
        self,
        provider: str,
    ) -> SystemKeyRecord | None:
        return self.system_key_model.get_system_key_by_provider(
            provider=provider,
        )

    def get_all_system_keys(
        self,
    ) -> list[SystemKeyRecord]:
        return self.system_key_model.get_all_system_key()
