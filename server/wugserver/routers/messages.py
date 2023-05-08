from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from wugserver.dependencies import get_db
from wugserver.models.db.interaction_model import get_interaction_by_id
from wugserver.models.db.message_model import get_interaction_messages
from wugserver.models.message_create_handler import handleMessageCreateRequest
from wugserver.schema.message import Message, MessageCreate
from wugserver.schema.user import *
from sqlalchemy.orm import Session
from wugserver.models.db.user_model import *

router = APIRouter()

@router.post("/interactions/{interaction_id}/messages/", response_model=Message)
def create_message_route(interaction_id: UUID, message_create_params: MessageCreate, db: Session = Depends(get_db)):
    interaction = get_interaction_by_id(db=db, interaction_id=interaction_id)
    if interaction == None:
        raise HTTPException(status_code=404, detail="Interaction doesn't exist.")

    try:
        return handleMessageCreateRequest(db, interaction_id, message_create_params)
    # TODO: fine-grained handling of Model API exceptions, DB exceptions, etc.
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {e}")

@router.get("/interactions/{interaction_id}/messages/", response_model=list[Message])
def get_messages_route(interaction_id: UUID, offset: int = 0, limit: int = 15, from_latest: bool = True, db: Session = Depends(get_db)):
    return get_interaction_messages(db=db, interaction_id=interaction_id, offset=offset, limit=limit, from_latest=from_latest)
