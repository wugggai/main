from sqlalchemy.orm import Session
from uuid import UUID
from wugserver.models.ai_models.models import AIModel

from wugserver.models.ai_models.openai_model import OpenAIModels
from wugserver.models.ai_models.echo_model import EchoModel
from wugserver.models.db.message_model import create_message
from wugserver.models.db.interaction_model import set_interaction_update_time_and_commit
from wugserver.schema.message import MessageCreate

# List of available models are not yet exposed via API. 
# Caller must pass the correct value string i.e. gpt-3.5-turbo to access the model
supported_models_name_to_model_class: dict[str, AIModel] = {}
supported_models: list[AIModel] = [OpenAIModels(), EchoModel()]

for model_cls in supported_models:
  supported_models_name_to_model_class.update({
    name: model_cls for name in model_cls.model_names
  })


def handle_message_create_request(db: Session, interaction_id: UUID, message_create_params: MessageCreate, acting_user_id: int):
  """
  handles all message creation requests
  passes message to appropriate model, writes messages to DB, and returns model's response
  Parameters:
  db                    (Session):       database object to interact with; some models may not require
  interaction_id        (UUID):          identifier of Interaction resource, used to retrieve past messages
  message_create_params (MessageCreate): parameters of message creation

  Returns:
  string: AI model's response
  int:    Interaction's current message offset
  """

  model_class = supported_models_name_to_model_class.get(message_create_params.model)
  if not model_class:
    raise NotImplementedError(f"Model {message_create_params.model} is not supported. Supported models: {', '.join(list(supported_models_name_to_model_class.keys()))}")
  try:
    model_res_msg, curr_offset = model_class.post_message(db, interaction_id, message_create_params, acting_user_id)
  except Exception as e:
    raise e

  # write both user msg and model msg to DB after model successfully returns
  # TODO: source column should store the userId rather than "user"
  create_message(db=db, interaction_id=interaction_id, source="user", message=message_create_params.message, offset=curr_offset + 1)
  ai_message = create_message(db=db, interaction_id=interaction_id, source=message_create_params.model, message=model_res_msg, offset=curr_offset + 2)

  # set the interaction's latest update time
  set_interaction_update_time_and_commit(db, interaction_id)
  return ai_message
