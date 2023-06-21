from uuid import UUID
from fastapi import APIRouter, Depends
from wugserver.dependencies import get_db
from wugserver.models.db.message_model import get_interaction_messages
from wugserver.models.user_authentication import get_current_active_user
from wugserver.models.message_create_handler import handle_message_create_request
from wugserver.routers.authorization import authorized_get_interaction
from wugserver.schema.message import Message, MessageCreate
from wugserver.schema.user import *
from sqlalchemy.orm import Session
from wugserver.models.db.user_db_model import UserRecord

router = APIRouter()


@router.post("/interactions/{interaction_id}/messages", response_model=Message)
def create_message_route(
    interaction_id: UUID,
    message_create_params: MessageCreate,
    db: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_active_user),
):
    interaction = authorized_get_interaction(
        db=db, current_user_id=current_user.id, interaction_id=interaction_id
    )
    return handle_message_create_request(
        db=db,
        user_id=current_user.id,
        interaction=interaction,
        message_create_params=message_create_params,
    )


@router.get("/interactions/{interaction_id}/messages", response_model=list[Message])
def get_messages_route(
    interaction_id: UUID,
    offset: int = 0,
    limit: int = 15,
    from_latest: bool = True,
    db: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_active_user),
):
    interaction = authorized_get_interaction(
        db=db, current_user_id=current_user.id, interaction_id=interaction_id
    )
    return get_interaction_messages(
        db=db,
        interaction=interaction,
        offset=offset,
        limit=limit,
        from_latest=from_latest,
    )
