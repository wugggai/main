from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from wugserver.dependencies import get_db
from wugserver.models.db.interaction_model import create_interaction, delete_interaction, get_deleted_interactions_by_creator_user_id, get_interactions_by_creator_user_id, update_interaction
from wugserver.models.db.message_model import get_interaction_last_message
from wugserver.models.message_create_handler import handle_message_create_request
from wugserver.models.user_authentication import get_current_active_user
from wugserver.routers.authorization import authorize_by_matching_user_id, authorized_get_interaction, authorized_get_tag
from wugserver.schema.interaction import Interaction, InteractionCreate, InteractionWithLatestMessage, InteractionUpdate
from wugserver.schema.user import *
from sqlalchemy.orm import Session
from wugserver.models.db.user_model import *

router = APIRouter()

@router.post("/users/{creator_user_id}/interactions", response_model=InteractionWithLatestMessage)
def create_interaction_route(creator_user_id: int, interaction_create_params: InteractionCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
  authorize_by_matching_user_id(current_user_id=current_user.id, user_id=creator_user_id)
  interaction = create_interaction(db=db, creator_user_id=creator_user_id, interaction_create_params=interaction_create_params)
  optional_message_response = None
  initial_message = interaction_create_params.initial_message
  if initial_message is not None:
    optional_message_response = handle_message_create_request(db=db, user_id=current_user.id, interaction=interaction, message_create_params=initial_message)
  
  return InteractionWithLatestMessage(interaction=interaction, last_message=optional_message_response)

@router.get("/users/{creator_user_id}/interactions", response_model=list[InteractionWithLatestMessage])
def get_interactions_route(creator_user_id: int, offset: int = 0, limit: int = 15, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
  authorize_by_matching_user_id(current_user_id=current_user.id, user_id=creator_user_id)
  interactions = get_interactions_by_creator_user_id(db=db, creator_user_id=creator_user_id, offset=offset, limit=limit)
  res = []
  for interaction in interactions:
    res.append(InteractionWithLatestMessage(
      interaction=interaction,
      last_message=get_interaction_last_message(db=db, interaction=interaction),
    ))
  return res

@router.get("/users/{creator_user_id}/interactions/deleted", response_model=list[InteractionWithLatestMessage])
def get_deleted_interactions_route(creator_user_id: int, offset: int = 0, limit: int = 15, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
  authorize_by_matching_user_id(current_user_id=current_user.id, user_id=creator_user_id)
  interactions = get_deleted_interactions_by_creator_user_id(db=db, creator_user_id=creator_user_id, offset=offset, limit=limit)
  res = []
  for interaction in interactions:
    res.append(InteractionWithLatestMessage(
      interaction=interaction,
      last_message=get_interaction_last_message(db=db, interaction=interaction),
    ))
  return res

@router.put("/interactions/{interaction_id}", response_model=Interaction)
def update_interaction_route(interaction_id: UUID, interaction_update_params: InteractionUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
  interaction = authorized_get_interaction(db=db, current_user_id=current_user.id, interaction_id=interaction_id, )
  # pre-fetch tags with authorization check
  tags = []
  if interaction_update_params.tag_ids is not None:
    tag_ids = interaction_update_params.tag_ids
    # do not allow repeated tags
    if len(set(tag_ids)) != len(tag_ids):
      raise HTTPException(status_code=400, detail="cannot assign duplicated tags")
    tags = [authorized_get_tag(db=db, current_user_id=current_user.id, tag_id=tag_id) for tag_id in tag_ids]
  return update_interaction(db=db, interaction=interaction, tags=tags, 
    title=interaction_update_params.title, deleted=interaction_update_params.deleted)

@router.delete("/interactions/{interaction_id}", status_code=200)
def delete_interaction_route(interaction_id: UUID, db: Session = Depends(get_db)):
  interaction = authorized_get_interaction(db=db, current_user_id=current_user.id, interaction_id=interaction_id)
  delete_interaction(db=db, interaction=interaction)
