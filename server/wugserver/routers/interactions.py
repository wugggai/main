import uuid
from fastapi import APIRouter, Depends
from wugserver.dependencies import get_db
from wugserver.models.db.interaction_model import create_interaction
from wugserver.schema.interaction import Interaction, InteractionCreate
from wugserver.schema.user import *
from sqlalchemy.orm import Session
from wugserver.models.db.user_model import *

router = APIRouter()

@router.post("/interactions/", response_model=Interaction)
def initiate_interaction_route(interactionCreate: InteractionCreate, db: Session = Depends(get_db)):
    return create_interaction(db=db, creatorUserId=uuid.uuid4(), interactionCreate=interactionCreate)