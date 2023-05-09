from uuid import UUID
from fastapi import APIRouter, Depends
from wugserver.dependencies import get_db
from wugserver.models.db.interaction_model import create_interaction, get_interactions_by_creator_user_id, update_interaction
from wugserver.models.db.message_model import get_interaction_last_message
from wugserver.models.message_create_handler import handleMessageCreateRequest
from wugserver.schema.interaction import Interaction, InteractionCreate, InteractionWithLatestMessage, InteractionUpdate
from wugserver.schema.user import *
from sqlalchemy.orm import Session
from wugserver.models.db.user_model import *

router = APIRouter()

@router.post("/users/{creator_user_id}/interactions/", response_model=InteractionWithLatestMessage)
def create_interaction_route(creator_user_id: int, interaction_create_params: InteractionCreate, db: Session = Depends(get_db)):
  interaction = create_interaction(db=db, creator_user_id=creator_user_id, interaction_create_params=interaction_create_params)
  optionalMessageResponse = None
  if interaction_create_params.initialMessage:
    optionalMessageResponse = handleMessageCreateRequest(db=db, interaction_id=interaction.id, message_create_params=interaction_create_params.initialMessage)
  
  return InteractionWithLatestMessage(interaction=interaction, last_message=optionalMessageResponse)

@router.get("/users/{creator_user_id}/interactions/", response_model=list[InteractionWithLatestMessage])
def get_interactions_route(creator_user_id: int, offset: int = 0, limit: int = 15, db: Session = Depends(get_db)):
  # TODO: wrap in 2 separate objects: an interaction and a message
  interactions = get_interactions_by_creator_user_id(db=db, creator_user_id=creator_user_id, offset=offset, limit=limit)
  res = []
  for interaction in interactions:
    res.append(InteractionWithLatestMessage(
      interaction=interaction,
      last_message=get_interaction_last_message(db, interaction.id),
    ))
  return res

@router.put("/interactions/{interaction_id}", response_model=Interaction)
def update_interaction_route(interaction_id: UUID, interaction_update_params: InteractionUpdate, db: Session = Depends(get_db)):
  return update_interaction(db=db, interaction_id=interaction_id, interaction_update_params=interaction_update_params)
