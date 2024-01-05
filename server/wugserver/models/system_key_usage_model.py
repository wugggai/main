from fastapi import Depends
from wugserver.constants import Provider

from wugserver.models.db.system_key_usage_db_model import SystemKeyUsageDbModel


class SystemKeyUsageModel:
    def __init__(
        self,
        system_key_usage_db_model: SystemKeyUsageDbModel = Depends(
            SystemKeyUsageDbModel
        ),
    ):
        self.system_key_usage_db_model = system_key_usage_db_model

    def user_can_use_system_key(self, user_id: int, provider: Provider, limit: int):
        record = self.system_key_usage_db_model.get_user_system_key_usage(
            user_id=user_id, provider=provider
        )
        return record is None or record.counter < limit

    def increment_user_system_key_usage(self, user_id: int, provider: Provider):
        self.system_key_usage_db_model.increment_user_system_key_usage(
            user_id, provider
        )
