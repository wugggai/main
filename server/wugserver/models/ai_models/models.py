from sqlalchemy.orm import Session
from uuid import UUID

from wugserver.schema.message import MessageCreate

class AIModel(object):

  def post_message(db: Session, interaction_id: UUID, message_create_params: MessageCreate):
    """
    sends messages to an AI model
    Parameters:
    db                    (Session):       database object to interact with; some models may not require
    interaction_id        (UUID):          identifier of Interaction resource, used to retrieve past messages
    message_create_params (MessageCreate): parameters of mesesage creation

    Returns:
    string: AI model's response
    int:    Interaction's current message offset
    """
    pass
