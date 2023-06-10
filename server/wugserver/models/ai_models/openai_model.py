from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

import logging
import openai

from wugserver.models.ai_models.models import AIModel
from wugserver.models.db.api_key_model import get_user_api_key_for_provider
from wugserver.models.db.interaction_model import InteractionModel
from wugserver.models.db.message_model import get_interaction_all_messages, MessageModel
from wugserver.schema.message import Message, MessageCreate


from wugserver.schema.message import MessageCreate
from wugserver.types.providers import Provider

class OpenAIModels(AIModel):

  model_names = ['gpt-3.5-turbo']
  provider = Provider.openai

  def post_message(self, db: Session, current_user_id: int, interaction: InteractionModel, message_create_params: MessageCreate):
    api_key = self.get_user_api_key(db=db, current_user_id=current_user_id, user_id=current_user_id)
    if (api_key is None):
      raise HTTPException(status_code=403, detail="no api key provided")
    current_messages = get_interaction_all_messages(db=db, interaction=interaction)
    current_offset = current_messages[-1].offset if current_messages else -1
    messages = [OpenAIModels.to_openai_message(m) for m in current_messages]
    messages.append(OpenAIModels.new_openai_message(message_create_params.message))

    # As of 4/29/2023 GPT3.5 doesn't accept parameters. Disregard messageCreateParams.model_config
    try:
      openai.api_key = api_key.api_key
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
