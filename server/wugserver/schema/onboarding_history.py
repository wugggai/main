from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class OnboardingHistory(BaseModel):
    onboarding_type: str
    count: int
    last_done: Optional[datetime]

    class Config:
        orm_mode = True
