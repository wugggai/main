from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from wugserver.dependencies import get_db
from wugserver.models.interaction_model import InteractionModel
from wugserver.models.db.user_db_model import UserRecord
from wugserver.models.api_key_model import ApiKeyModel
from wugserver.models.message_create_handler import handle_message_create_request
from wugserver.models.message_model import MessageModel
from wugserver.models.system_key_model import SystemKeyModel
from wugserver.models.system_key_usage_mdoel import SystemKeyUsageModel
from wugserver.models.tag_model import TagModel
from wugserver.models.user_authentication import get_current_active_user
from wugserver.routers.authorization import (
    authorize_by_matching_user_id,
    authorized_get_interaction,
    authorized_get_tag,
)
from wugserver.schema.interaction import (
    Interaction,
    InteractionCreate,
    InteractionWithLatestMessage,
    InteractionUpdate,
)
from wugserver.schema.message import MessageTypes

router = APIRouter()


@router.post(
    "/users/{creator_user_id}/interactions", response_model=InteractionWithLatestMessage
)
def create_interaction_route(
    creator_user_id: int,
    interaction_create_params: InteractionCreate,
    current_user: UserRecord = Depends(get_current_active_user),
    api_key_model: ApiKeyModel = Depends(ApiKeyModel),
    interaction_model: InteractionModel = Depends(InteractionModel),
    message_model: MessageModel = Depends(MessageModel),
    system_key_usage_model: SystemKeyUsageModel = Depends(SystemKeyUsageModel),
    system_key_model: SystemKeyModel = Depends(SystemKeyModel),
):
    authorize_by_matching_user_id(
        current_user_id=current_user.id, user_id=creator_user_id
    )
    initial_message = interaction_create_params.initial_message
    auto_title = "New Conversation"
    if initial_message is not None:
        for segment in initial_message.message:
            if segment.type == MessageTypes.text:
                auto_title = " ".join(segment.content.split()[:10])
                break
    interaction = interaction_model.create_interaction(
        creator_user_id=creator_user_id,
        interaction_create_params=interaction_create_params,
        auto_title=auto_title,
    )
    optional_message_response = None
    if initial_message is not None:
        optional_message_response = handle_message_create_request(
            user_id=current_user.id,
            interaction=interaction,
            message_create_params=initial_message,
            api_key_model=api_key_model,
            interaction_model=interaction_model,
            message_model=message_model,
            system_key_usage_model=system_key_usage_model,
            system_key_model=system_key_model,
        )

    return InteractionWithLatestMessage(
        interaction=interaction,
        last_message=optional_message_response,
    )


@router.get(
    "/users/{creator_user_id}/interactions",
    response_model=list[InteractionWithLatestMessage],
)
def get_interactions_route(
    creator_user_id: int,
    offset: int = 0,
    limit: int = 15,
    current_user: UserRecord = Depends(get_current_active_user),
    interaction_model: InteractionModel = Depends(InteractionModel),
    message_model: MessageModel = Depends(MessageModel),
):
    authorize_by_matching_user_id(
        current_user_id=current_user.id, user_id=creator_user_id
    )
    interactions = interaction_model.get_interactions_by_creator_user_id(
        creator_user_id=creator_user_id,
        offset=offset,
        limit=limit,
    )
    res = []
    for interaction in interactions:
        res.append(
            InteractionWithLatestMessage(
                interaction=interaction,
                last_message=message_model.db_message_to_pydantic_message(
                    message_model.get_interaction_last_message(interaction=interaction)
                ),
            )
        )
    return res


@router.get(
    "/users/{creator_user_id}/interactions/deleted",
    response_model=list[InteractionWithLatestMessage],
)
def get_deleted_interactions_route(
    creator_user_id: int,
    offset: int = 0,
    limit: int = 15,
    current_user: UserRecord = Depends(get_current_active_user),
    interaction_model: InteractionModel = Depends(InteractionModel),
    message_model: MessageModel = Depends(MessageModel),
):
    authorize_by_matching_user_id(
        current_user_id=current_user.id, user_id=creator_user_id
    )
    interactions = interaction_model.get_deleted_interactions_by_creator_user_id(
        creator_user_id=creator_user_id, offset=offset, limit=limit
    )
    res = []
    for interaction in interactions:
        res.append(
            InteractionWithLatestMessage(
                interaction=interaction,
                last_message=message_model.db_message_to_pydantic_message(
                    message_model.get_interaction_last_message(interaction=interaction)
                ),
            )
        )
    return res


@router.put("/interactions/{interaction_id}", response_model=Interaction)
def update_interaction_route(
    interaction_id: UUID,
    interaction_update_params: InteractionUpdate,
    db: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_active_user),
    interaction_model: InteractionModel = Depends(InteractionModel),
    tag_model: TagModel = Depends(TagModel),
):
    interaction = authorized_get_interaction(
        current_user_id=current_user.id,
        interaction_id=interaction_id,
        interaction_model=interaction_model,
    )
    # pre-fetch tags with authorization check
    tags = []
    if interaction_update_params.tag_ids is not None:
        tag_ids = interaction_update_params.tag_ids
        # do not allow repeated tags
        if len(set(tag_ids)) != len(tag_ids):
            raise HTTPException(status_code=400, detail="cannot assign duplicated tags")
        tags = [
            authorized_get_tag(
                current_user_id=current_user.id,
                tag_id=tag_id,
                tag_model=tag_model,
            )
            for tag_id in tag_ids
        ]
    return interaction_model.update_interaction(
        interaction=interaction,
        tags=tags,
        title=interaction_update_params.title,
        deleted=interaction_update_params.deleted,
    )


@router.delete("/interactions/{interaction_id}", status_code=200)
def delete_interaction_route(
    interaction_id: UUID,
    current_user: UserRecord = Depends(get_current_active_user),
    interaction_model: InteractionModel = Depends(InteractionModel),
):
    interaction = authorized_get_interaction(
        current_user_id=current_user.id,
        interaction_id=interaction_id,
        interaction_model=interaction_model,
    )
    interaction_model.delete_interaction(interaction_id=interaction.id)
