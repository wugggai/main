from uuid import UUID
from fastapi import APIRouter, Depends
from wugserver.dependencies import get_db
from wugserver.models.db.interaction_model import create_interaction, get_interactions_by_creator_user_id
from wugserver.models.db.message_model import get_interaction_last_message
from wugserver.schema.interaction import Interaction, InteractionCreate, InteractionGetAllResponse
from wugserver.schema.user import *
from sqlalchemy.orm import Session
from wugserver.models.db.user_model import *

router = APIRouter()

@router.post("/interactions/", response_model=Interaction)
def initiate_interaction_route(interactionCreateParams: InteractionCreate, db: Session = Depends(get_db)):
    return create_interaction(db=db, interactionCreateParams=interactionCreateParams)

@router.get("/users/{creatorUserId}/interactions/", response_model=list[InteractionGetAllResponse])
def get_interactions_by_user(creatorUserId: UUID, offset: int = 0, limit: int = 15, db: Session = Depends(get_db)):
    interactions = get_interactions_by_creator_user_id(db=db, creatorUserId=creatorUserId, offset=offset, limit=limit)
    res = []
    for interaction in interactions:
        res.append(InteractionGetAllResponse(
            id=interaction.id,
            title=interaction.title,
            last_updated=interaction.last_updated,
            last_message=get_interaction_last_message(db, interaction.id)
        ))
    return res
