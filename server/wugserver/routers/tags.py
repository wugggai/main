from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from wugserver.dependencies import get_db
from wugserver.schema.tag import Tag, TagCreate
from wugserver.models.db.tag_model import create_tag, get_tags_by_user_id, update_tag, delete_tag
from sqlalchemy.orm import Session
from wugserver.models.db.user_model import *

router = APIRouter()

@router.post("/users/{user_id}/tags/", response_model=Tag)
def create_tag_route(user_id: UUID, tag_create_params: TagCreate, db: Session = Depends(get_db)):
  return create_tag(db=db, user_id=user_id, tag_create_params=tag_create_params)

@router.get("/users/{user_id}/tags/", response_model=list[Tag])
def get_tags_route(user_id: UUID, db: Session = Depends(get_db)):
  return get_tags_by_user_id(db=db, user_id=user_id)

@router.put("tags/{tag_id}", response_model=Tag)
def update_tag_route(tag_id: UUID, tag_update_params: TagCreate, db: Session = Depends(get_db)):
  # TODO: authn/z
  return update_tag(db=db, tag_id=tag_id, tag_update_params=tag_update_params)

@router.delete("tags/{tag_id}", status_code=204)
def delete_tag_route(tag_id: UUID, db: Session = Depends(get_db)):
  # TODO: authn/z
  delete_tag(db=db, tag_id=tag_id)
