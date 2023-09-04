from fastapi import Depends
from wugserver.models.db.onboarding_history_db_model import (
    OnboardingHistoryDbModel,
    OnboardingHistoryRecord,
)


class OnboardingHistoryModel:
    def __init__(
        self,
        onboarding_history_db_model: OnboardingHistoryDbModel = Depends(
            OnboardingHistoryDbModel
        ),
    ):
        self.onboarding_history_db_model = onboarding_history_db_model

    def create_or_increment_onboarding_history(
        self,
        user_id: int,
        type: str,
    ) -> OnboardingHistoryRecord:
        return self.onboarding_history_db_model.create_or_increment_onboarding_history(
            user_id, type
        )

    def get_user_onboarding_history(
        self, user_id: int, type: str
    ) -> OnboardingHistoryRecord | None:
        return self.onboarding_history_db_model.get_user_onboarding_history(
            user_id, type
        )
