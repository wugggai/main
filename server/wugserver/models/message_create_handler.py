from sqlalchemy.orm import Session
from uuid import UUID

from wugserver.models.ai_models.openai_model import OpenAIModels
from wugserver.models.db.message_model import write_message_to_db
from wugserver.models.db.interaction_model import set_interaction_update_time
from wugserver.schema.message import MessageCreate

# List of available models are not yet exposed via API. 
# Caller must pass the correct value string i.e. gpt-3.5-turbo to access the model
supported_models_name_to_model_class = {}
supported_models = [OpenAIModels]

for model_cls in supported_models:
  supported_models_name_to_model_class.update({
    name: model_cls for name in model_cls.model_names
  })


def handleMessageCreateRequest(db: Session, interactionId: UUID, messageCreateParams: MessageCreate):
  """
  handles all message creation requests
  passes message to appropriate model, writes messages to DB, and returns model's response
  Parameters:
  db                  (Session):       database object to interact with; some models may not require
  interactionId       (UUID):          identifier of Interaction resource, used to retrieve past messages
  messageCreateParams (MessageCreate): parameters of message creation

  Returns:
  string: AI model's response
  int:    Interaction's current message offset
  """

  modelClass = supported_models_name_to_model_class.get(messageCreateParams.model)
  if not modelClass:
    raise NotImplementedError(f"Model {messageCreateParams.model} is not supported. Supported models: {', '.join(list(supported_models_name_to_model_class.keys()))}")
  try:
    modelResMsg, currOffset = modelClass.post_message(db, interactionId, messageCreateParams)
  except Exception as e:
    raise ConnectionError(f"Unable to interact with {messageCreateParams.model}: {e}")

  # write both user msg and model msg to DB after model successfully returns
  # TODO: source column should store the userId rather than "user"
  write_message_to_db(db=db, interactionId=interactionId, source="user", message=messageCreateParams.message, offset=currOffset + 1)
  aiMessage = write_message_to_db(db=db, interactionId=interactionId, source=messageCreateParams.model, message=modelResMsg, offset=currOffset + 2)

  # set the interaction's latest update time
  set_interaction_update_time(db, interactionId)
  return aiMessage
