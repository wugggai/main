from fastapi import APIRouter, Depends, HTTPException, Request
from wugserver.dependencies import get_db
from wugserver.models.ai_model_model import get_user_available_models
from wugserver.models.api_key_model import ApiKeyModel
from wugserver.models.db.system_key_usage_db_model import SystemKeyUsageDbModel
from wugserver.models.onboarding_history_model import OnboardingHistoryModel
from wugserver.models.system_key_model import SystemKeyModel
from wugserver.models.system_key_usage_mdoel import SystemKeyUsageModel
from wugserver.models.user_authentication import get_current_active_user, register_user
from wugserver.models.user_model import UserModel
from wugserver.models.user_password_model import UserPasswordModel
from wugserver.routers.authorization import authorize_by_matching_user_id
from wugserver.schema.model_list import ModelList
from wugserver.schema.onboarding_history import OnboardingHistory
from wugserver.schema.user import User, UserCreate
from sqlalchemy.orm import Session
from wugserver.models.db.user_db_model import UserRecord
from wugserver.types.onboarding_types import OnboardingType

router = APIRouter()


@router.post("/users", response_model=User)
def create_user_route(
    user: UserCreate,
    db: Session = Depends(get_db),
    user_password_model: UserPasswordModel = Depends(UserPasswordModel),
    user_model: UserModel = Depends(UserModel),
):
    db_user = user_model.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    return register_user(
        db=db,
        user=user,
        user_password_model=user_password_model,
        user_model=user_model,
    )


@router.get("/users/me", response_model=User)
def read_users_me(
    current_user: UserRecord = Depends(get_current_active_user),
):
    return current_user


@router.get("/users/{user_id}/models/list", response_model=ModelList)
def get_users_available_models(
    user_id: int,
    current_user: UserRecord = Depends(get_current_active_user),
    api_key_model: ApiKeyModel = Depends(ApiKeyModel),
    system_key_model: SystemKeyModel = Depends(SystemKeyModel),
    system_key_usage_model: SystemKeyUsageModel = Depends(SystemKeyUsageModel),
):
    authorize_by_matching_user_id(current_user.id, user_id)

    return ModelList(
        model_names=get_user_available_models(
            user_id=current_user.id,
            api_key_model=api_key_model,
            system_key_model=system_key_model,
            system_key_usage_model=system_key_usage_model,
        )
    )


@router.get(
    "/users/{user_id}/onboardinghistory/{_type}", response_model=OnboardingHistory
)
def get_user_onboarding_history(
    user_id: int,
    _type: OnboardingType,
    current_user: UserRecord = Depends(get_current_active_user),
    onboarding_history_model: OnboardingHistoryModel = Depends(OnboardingHistoryModel),
):
    authorize_by_matching_user_id(current_user.id, user_id)
    existing = onboarding_history_model.get_user_onboarding_history(user_id, _type)
    if existing != None:
        return existing
    return OnboardingHistory(onboarding_type=_type.value, count=0, last_done=None)


@router.put(
    "/users/{user_id}/onboardinghistory/{_type}", response_model=OnboardingHistory
)
def put_user_onboarding_history(
    user_id: int,
    _type: OnboardingType,
    current_user: UserRecord = Depends(get_current_active_user),
    onboarding_history_model: OnboardingHistoryModel = Depends(OnboardingHistoryModel),
):
    authorize_by_matching_user_id(current_user.id, user_id)

    return onboarding_history_model.create_or_increment_onboarding_history(
        user_id, _type
    )
