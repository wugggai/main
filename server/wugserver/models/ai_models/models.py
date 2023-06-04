from sqlalchemy.orm import Session
from uuid import UUID
from wugserver.models.db.api_key_model import get_user_api_key_for_provider

from wugserver.schema.message import MessageCreate
from wugserver.types.providers import Provider

class AIModel(object):
  provider: Provider
  model_names: list[str]

  def post_message(self, db: Session, interaction_id: UUID, message_create_params: MessageCreate, acting_user_id: int):
    """
    sends messages to an AI model
    Parameters:
    db                    (Session):       database object to interact with; some models may not require
    interaction_id        (UUID):          identifier of Interaction resource, used to retrieve past messages
    message_create_params (MessageCreate): parameters of mesesage creation
    acting_user_id        (int):           the acting user's id. we need to determine whose api key to make the request with

    Returns:
    string: AI model's response
    int:    Interaction's current message offset
    """
    pass

  def get_user_api_key(self, db: Session, user_id: int):
    return get_user_api_key_for_provider(db=db, user_id=user_id, provider=self.provider)
