from uuid import UUID
from fastapi import APIRouter, Depends
from wugserver.dependencies import get_db
from wugserver.models.db.user_db_model import UserRecord
from wugserver.models.message_model import MessageModel
from wugserver.models.user_authentication import get_current_active_user
from wugserver.models.message_create_handler import handle_message_create_request
from wugserver.routers.authorization import (
    authorize_by_matching_user_id,
    authorized_get_interaction,
)
from wugserver.schema.message import Message, MessageCreate
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/interactions/{interaction_id}/messages", response_model=Message)
def create_message_route(
    interaction_id: UUID,
    message_create_params: MessageCreate,
    db: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_active_user),
    message_model: MessageModel = Depends(MessageModel),
):
    interaction = authorized_get_interaction(
        db=db, current_user_id=current_user.id, interaction_id=interaction_id
    )
    return handle_message_create_request(
        db=db,
        user_id=current_user.id,
        interaction=interaction,
        message_create_params=message_create_params,
        message_model=message_model,
    )


@router.get("/interactions/{interaction_id}/messages", response_model=list[Message])
def get_messages_route(
    interaction_id: UUID,
    offset: int = 0,
    limit: int = 15,
    from_latest: bool = True,
    db: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_active_user),
    message_model: MessageModel = Depends(MessageModel),
):
    interaction = authorized_get_interaction(
        db=db, current_user_id=current_user.id, interaction_id=interaction_id
    )
    raw_messages = message_model.get_interaction_messages(
        interaction=interaction,
        offset=offset,
        limit=limit,
        from_latest=from_latest,
    )
    return [
        message_model.db_message_to_pydantic_message(raw_message)
        for raw_message in raw_messages
    ]


@router.post("/users/{user_id}/messages/{message_id}/favorite")
def create_favorite_message_route(
    user_id: int,
    message_id: UUID,
    current_user: UserRecord = Depends(get_current_active_user),
    message_model: MessageModel = Depends(MessageModel),
):
    authorize_by_matching_user_id(current_user.id, user_id)
    return message_model.create_favorite_message_for_user(current_user.id, message_id)


@router.delete("/users/{user_id}/messages/{message_id}/favorite")
def delete_favorite_message_route(
    user_id: int,
    message_id: UUID,
    current_user: UserRecord = Depends(get_current_active_user),
    message_model: MessageModel = Depends(MessageModel),
):
    authorize_by_matching_user_id(current_user.id, user_id)
    return message_model.delete_favorite_message_for_user(current_user.id, message_id)


@router.get("/users/{user_id}/messages/favorite", response_model=list[Message])
def get_favorite_message_route(
    user_id: int,
    current_user: UserRecord = Depends(get_current_active_user),
    message_model: MessageModel = Depends(MessageModel),
):
    authorize_by_matching_user_id(current_user.id, user_id)
    return message_model.get_favorite_messages_for_user(current_user.id)
