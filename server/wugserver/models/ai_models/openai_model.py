from uuid import UUID
import logging
import openai
from wugserver.models.ai_models.models import AIModel
from wugserver.models.db.message_model import get_interaction_messages, MessageModel
from wugserver.schema.message import Message, MessageCreate
from sqlalchemy.orm import Session

from wugserver.schema.message import MessageCreate

class OpenAIModels(AIModel):

  model_names = ['gpt-3.5-turbo']

  def post_message(db: Session, interactionId: UUID, messageCreateParams: MessageCreate):
    currentMessages = get_interaction_messages(db=db, interactionId=interactionId)
    logging.info(f"historical messages: {currentMessages}")
    currentOffset = currentMessages[-1].offset if currentMessages else -1
    messages = [OpenAIModels.toOpenaiMessage(m) for m in currentMessages]
    messages.append(OpenAIModels.newOpenaiMessage(messageCreateParams.message))

    # As of 4/29/2023 GPT3.5 fine-tuning is unavailable. Disregard messageCreateParams.model_config
    try:
      response = openai.ChatCompletion.create(
        model=messageCreateParams.model,
        messages=messages
      )
      return response['choices'][0]['message']['content'], currentOffset
    # TODO: handle model-specific errors here
    except Exception as e:
      raise e

  def newOpenaiMessage(message: str):
    return {"role": "user", "content": message}

  def toOpenaiMessage(message: Message):
    return {"role": "assistant" if message.source in OpenAIModels.model_names else "user", "content": message.message}
