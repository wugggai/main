from sqlalchemy.orm import Session
from uuid import UUID

import logging
import openai

from wugserver.models.ai_models.models import AIModel
from wugserver.models.db.message_model import get_interaction_all_messages, MessageModel
from wugserver.schema.message import Message, MessageCreate


from wugserver.schema.message import MessageCreate

class OpenAIModels(AIModel):

  model_names = ['gpt-3.5-turbo']

  def post_message(db: Session, interaction_id: UUID, message_create_params: MessageCreate):
    current_messages = get_interaction_all_messages(db=db, interaction_id=interaction_id)
    current_offset = current_messages[-1].offset if current_messages else -1
    messages = [OpenAIModels.to_openai_message(m) for m in current_messages]
    messages.append(OpenAIModels.new_openai_message(message_create_params.message))

    # As of 4/29/2023 GPT3.5 doesn't accept parameters. Disregard messageCreateParams.model_config
    try:
      response = openai.ChatCompletion.create(
        model=message_create_params.model,
        messages=messages
      )
      return response['choices'][0]['message']['content'], current_offset
    # TODO: handle model-specific errors here
    except Exception as e:
      raise e

  def new_openai_message(message: str):
    return {"role": "user", "content": message}

  def to_openai_message(message: Message):
    return {"role": "assistant" if message.source in OpenAIModels.model_names else "user", "content": message.message}
