from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from wugserver.dependencies import get_db
from wugserver.routers.authorization import (
    authorize_by_matching_user_id,
    authorized_get_tag,
)
from wugserver.schema.tag import Tag, TagCreate
from wugserver.models.db.tag_model import (
    create_tag,
    get_tags_by_user_id,
    update_tag,
    delete_tag,
)
from wugserver.models.user_authentication import get_current_active_user
from wugserver.models.db.user_db_model import *

router = APIRouter()


@router.post("/users/{user_id}/tags", response_model=Tag)
def create_tag_route(
    user_id: int,
    tag_create_params: TagCreate,
    db: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_active_user),
):
    authorize_by_matching_user_id(current_user_id=current_user.id, user_id=user_id)
    return create_tag(db=db, user_id=user_id, tag_create_params=tag_create_params)


@router.get("/users/{user_id}/tags", response_model=list[Tag])
def get_tags_route(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_active_user),
):
    authorize_by_matching_user_id(current_user_id=current_user.id, user_id=user_id)
    return get_tags_by_user_id(db=db, user_id=user_id)


@router.put("/tags/{tag_id}", response_model=Tag)
def update_tag_route(
    tag_id: UUID,
    tag_update_params: TagCreate,
    db: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_active_user),
):
    tag = authorized_get_tag(db=db, current_user_id=current_user.id, tag_id=tag_id)
    return update_tag(db=db, tag=tag, tag_update_params=tag_update_params)


@router.delete("/tags/{tag_id}", status_code=204)
def delete_tag_route(
    tag_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_active_user),
):
    tag = authorized_get_tag(db=db, current_user_id=current_user.id, tag_id=tag_id)
    delete_tag(db=db, tag=tag)
