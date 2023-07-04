from fastapi import HTTPException
from sqlalchemy.orm import Session

from wugserver.models.ai_model_model import get_model_by_name
from wugserver.models.db.interaction_model import (
    InteractionRecord,
    set_interaction_update_time_and_commit,
)
from wugserver.models.message_model import MessageModel
from wugserver.schema.message import MessageCreate, MessageSegment


def handle_message_create_request(
    db: Session,
    user_id: int,
    interaction: InteractionRecord,
    message_create_params: MessageCreate,
    message_model: MessageModel,
):
    """
    handles all message creation requests
    passes message to appropriate model, writes messages to DB, and returns model's response
    Parameters:
    db                    (Session):          database object to interact with; some models may not require
    interaction           (InteractionModel): interaction resource, used to retrieve context
    message_create_params (MessageCreate):    parameters of message creation
    user_id               (int):              acting user

    Returns:
    string: AI model's response
    """

    requested_model = get_model_by_name(message_create_params.model)
    if not requested_model:
        raise HTTPException(
            status_code=404, detail=f"{message_create_params.model} is not availble"
        )
    # verifies that user has provided api_key
    api_key = requested_model.get_user_api_key(db=db, user_id=user_id)
    if api_key is None:
        raise HTTPException(
            status_code=403,
            detail=f"No API key provided for {message_create_params.model}",
        )

    try:
        requested_model.assert_input_format(message_create_params.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Bad input: {e}")

    interaction_context = []
    if requested_model.requires_context():
        interaction_context = message_model.get_interaction_all_messages(
            interaction=interaction
        )
    try:
        model_res_msg: list[MessageSegment] = requested_model.post_message(
            api_key=api_key,
            interaction_context=interaction_context,
            message_create_params=message_create_params,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot send message to {message_create_params.model}: {e}",
        )

    message_model.create_message(
        interaction=interaction,
        source=f"user_{user_id}",
        message=message_create_params.message,
    )
    ai_message = message_model.create_message(
        interaction=interaction,
        source=message_create_params.model,
        message=model_res_msg,
    )

    # set the interaction's latest update time
    set_interaction_update_time_and_commit(db=db, interaction=interaction)
    print(ai_message)
    print(MessageModel.db_message_to_pydantic_message(ai_message))
    return MessageModel.db_message_to_pydantic_message(ai_message)
