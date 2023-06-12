from fastapi import APIRouter, Depends, HTTPException
from wugserver.dependencies import get_db
from wugserver.models.db.api_key_model import create_api_key_record, get_all_user_api_keys, get_user_api_key_for_provider, update_api_key_record
from wugserver.schema.api_key import ApiKeyBase, ApiKeyCreate
from wugserver.schema.user import *
from sqlalchemy.orm import Session
from wugserver.models.db.user_model import *
from wugserver.models.user_authentication import get_current_active_user
from wugserver.types.providers import Provider

router = APIRouter()

@router.post("/users/{user_id}/apikey/providers/{provider}", response_model=ApiKeyBase)
def create_api_key_route(user_id: int, provider: Provider, api_key_create: ApiKeyCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
  existing_key = get_user_api_key_for_provider(db=db, current_user_id=current_user.id, user_id=user_id, provider=provider)
  if existing_key:
    raise HTTPException(status_code=409, detail="API Key already provided")
  return create_api_key_record(db=db, current_user_id=current_user.id, user_id=user_id, provider=provider, api_key_create=api_key_create)

@router.put("/users/{user_id}/apikey/providers/{provider}", response_model=ApiKeyBase)
def update_api_key_route(user_id: int, provider: Provider, api_key_create: ApiKeyCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
  existing_key = get_user_api_key_for_provider(db=db, current_user_id=current_user.id, user_id=user_id, provider=provider)
  if not existing_key:
    raise HTTPException(status_code=404, detail="API Key doesn't exist")
  return update_api_key_record(db=db, current_user_id=current_user.id, user_id=user_id, provider=provider, api_key_create=api_key_create)

@router.get("/users/{user_id}/apikey/providers/{provider}", response_model=ApiKeyBase)
def get_api_key_route(user_id: int, provider: Provider, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    existing_key = get_user_api_key_for_provider(db=db, current_user_id=current_user.id, user_id=user_id, provider=provider)
    if not existing_key:
        raise HTTPException(status_code=404, detail="API Key doesn't exist")
    return existing_key

@router.get("/users/{user_id}/apikey", response_model=list[ApiKeyBase])
def get_all_api_key_route(user_id: int, db: Session = Depends(get_db)):
    return get_all_user_api_keys(db=db, user_id=user_id)
