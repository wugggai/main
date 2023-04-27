from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from wugserver.dependencies import get_db
from wugserver.models.db.interaction_model import get_interaction_by_id
from wugserver.models.external.openai_model import post_message_to_openai
from wugserver.schema.message import Message, MessageCreate
from wugserver.schema.user import *
from sqlalchemy.orm import Session
from wugserver.models.db.user_model import *

router = APIRouter()

@router.post("/interactions/{interactionId}/messages/", response_model=Message)
def create_message(interactionId: UUID, messageCreate: MessageCreate, db: Session = Depends(get_db)):
    interaction = get_interaction_by_id(db=db, interactionId=interactionId)
    if interaction == None:
        raise HTTPException(status_code=404, detail="Interaction doesn't exist.")
    return post_message_to_openai(db=db, interactionId=interactionId, messageCreate=messageCreate)