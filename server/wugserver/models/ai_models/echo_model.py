from sqlalchemy.orm import Session
from uuid import UUID

from wugserver.models.ai_models.models import AIModel
from wugserver.models.db.message_model import get_interaction_message_count
from wugserver.schema.message import MessageCreate
from wugserver.types.providers import Provider

"""
A dummy model which accepts a single user message in text and repeats it
Internal testing only
"""
class EchoModel(AIModel):
    
  model_names = ['echo']
  provider = Provider.none

  def post_message(self, db: Session, interaction_id: UUID, message_create_params: MessageCreate, acting_user_id: int):
    current_messages_count = get_interaction_message_count(db=db, interaction_id=interaction_id)
    current_offset = current_messages_count - 1

    return (
      f'You just created Message #{current_messages_count} '
      f'in interaction {interaction_id}. '
      f'The message was: "{message_create_params.message}". '
      f'This response message is Message #{current_messages_count + 1}.'
    ), current_offset
