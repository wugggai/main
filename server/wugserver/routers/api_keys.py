from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from wugserver.dependencies import get_db
from wugserver.models.api_key_model import ApiKeyModel
from wugserver.models.db.user_db_model import UserRecord
from wugserver.models.message_create_handler import verify_api_key
from wugserver.models.user_authentication import get_current_active_user
from wugserver.routers.authorization import authorize_by_matching_user_id
from wugserver.schema.api_key import ApiKeyBase, ApiKeyCreate
from wugserver.schema.user import *
from wugserver.constants import Provider

router = APIRouter()


# NOTE: Endpoints must never return unobfuscated API Key
#       Client should not need to implement obfuscation
@router.post("/users/{user_id}/apikey/providers/{provider}", response_model=ApiKeyBase)
def create_or_update_api_key_route(
    user_id: int,
    provider: Provider,
    api_key_create: ApiKeyCreate,
    current_user: UserRecord = Depends(get_current_active_user),
    api_key_model: ApiKeyModel = Depends(ApiKeyModel),
):
    authorize_by_matching_user_id(current_user_id=current_user.id, user_id=user_id)
    existing_key = api_key_model.get_api_key_by_provider(
        user_id=user_id, provider=provider
    )
    verify_api_key(key=api_key_create.api_key, provider_name=provider)
    if existing_key:
        record = api_key_model.update_api_key(
            user_id=user_id, provider=provider, api_key=api_key_create
        )
    else:
        record = api_key_model.create_api_key(
            user_id=user_id, provider=provider, api_key=api_key_create
        )
    return api_key_model.obfuscate_api_key_record(record)


@router.get("/users/{user_id}/apikey/providers/{provider}", response_model=ApiKeyBase)
def get_api_key_route(
    user_id: int,
    provider: Provider,
    current_user: UserRecord = Depends(get_current_active_user),
    api_key_model: ApiKeyModel = Depends(ApiKeyModel),
):
    authorize_by_matching_user_id(current_user_id=current_user.id, user_id=user_id)
    existing_key = api_key_model.get_api_key_by_provider(
        user_id=user_id, provider=provider
    )
    if not existing_key:
        raise HTTPException(status_code=404, detail="API Key not provided")
    return api_key_model.obfuscate_api_key_record(existing_key)


@router.get("/users/{user_id}/apikey", response_model=list[ApiKeyBase])
def get_all_api_key_route(
    user_id: int,
    current_user: UserRecord = Depends(get_current_active_user),
    api_key_model: ApiKeyModel = Depends(ApiKeyModel),
):
    authorize_by_matching_user_id(current_user_id=current_user.id, user_id=user_id)
    records = api_key_model.get_all_api_keys(user_id=user_id)
    return [api_key_model.obfuscate_api_key_record(record) for record in records]


@router.delete("/users/{user_id}/apikey/providers/{provider}", status_code=204)
def delete_api_key_route(
    user_id: int,
    provider: Provider,
    current_user: UserRecord = Depends(get_current_active_user),
    api_key_model: ApiKeyModel = Depends(ApiKeyModel),
):
    authorize_by_matching_user_id(current_user_id=current_user.id, user_id=user_id)
    api_key_model.delete_api_key(user_id=user_id, provider=provider)
