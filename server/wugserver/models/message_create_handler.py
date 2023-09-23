from fastapi import HTTPException
from sqlalchemy.orm import Session

from wugserver.constants import Provider, get_provider_by_name
from wugserver.models.ai_model_model import get_any_model_of_provider, get_model_by_name
from wugserver.models.api_key_model import ApiKeyModel
from wugserver.models.db.interaction_model import (
    InteractionRecord,
    set_interaction_update_time_and_commit,
)
from wugserver.models.message_model import MessageModel
from wugserver.models.system_key_model import SystemKeyModel
from wugserver.models.system_key_usage_mdoel import SystemKeyUsageModel
from wugserver.schema.api_key import ApiKeyCreate
from wugserver.schema.message import MessageCreate, MessageSegment


def _get_correct_api_key_for_model(
    user_id: int,
    provider: Provider,
    message_create_params: MessageCreate,
    api_key_model: ApiKeyModel,
    system_key_usage_model: SystemKeyUsageModel,
    system_key_model: SystemKeyModel,
) -> str:
    if message_create_params.using_system_key:
        system_key = system_key_model.get_system_key_by_provider(provider=provider)
        if system_key is None:
            raise HTTPException(
                status_code=403,
                detail=f"no System key for {message_create_params.model}",
            )
        if not system_key_usage_model.user_can_user_system_key(
            user_id=user_id, provider=provider, limit=system_key.limit
        ):
            raise HTTPException(
                status_code=403,
                detail=f"You've reached the limit of trial key for {message_create_params.model}",
            )
        system_key_usage_model.user_can_user_system_key
        return system_key.key
    else:
        api_key_record = api_key_model.get_api_key_by_provider(
            user_id=user_id,
            provider=provider,
        )

        if api_key_record is None:
            raise HTTPException(
                status_code=403,
                detail=f"no API key provided for {message_create_params.model}",
            )

        return api_key_record.api_key


def handle_message_create_request(
    db: Session,
    user_id: int,
    interaction: InteractionRecord,
    message_create_params: MessageCreate,
    message_model: MessageModel,
    api_key_model: ApiKeyModel,
    system_key_usage_model: SystemKeyUsageModel,
    system_key_model: SystemKeyModel,
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
    api_key: str = ""
    # verifies that user has provided api_key
    provider = requested_model.get_provider()
    if requested_model.requires_api_key():
        api_key = _get_correct_api_key_for_model(
            user_id=user_id,
            provider=provider,
            message_create_params=message_create_params,
            api_key_model=api_key_model,
            system_key_usage_model=system_key_usage_model,
            system_key_model=system_key_model,
        )

    try:
        requested_model.assert_input_format(message_create_params)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"bad input: {e}")

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
            detail=f"cannot get response from {message_create_params.model}: {e}. Please double check your API key's payment setting.",
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
    return MessageModel.db_message_to_pydantic_message(ai_message)


# verify_api_key sends a dummy message to a model of the corresponding key's provider
# raises HTTP 400 if API key is unusable
def verify_api_key(key: str, provider_name: str):
    try:
        provider = get_provider_by_name(provider_name)
        model_cls = get_any_model_of_provider(provider)
        model = model_cls.get_user_verification_model(key)
        try:
            model_cls.post_message(
                api_key=key,
                interaction_context=[],
                message_create_params=MessageCreate(
                    message=[
                        MessageSegment(
                            type="text",
                            content="Hello World",
                        )
                    ],
                    model=model,
                    model_config={},
                ),
            )
        except Exception as exception:
            raise Exception(f"failed to send message to {model}: {exception}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"API Key verification failed: {e}")
