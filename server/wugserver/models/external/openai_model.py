from uuid import UUID, uuid4
import openai
from wugserver.models.db.message_model import create_message, get_interaction_messages

from wugserver.schema.interaction import Interaction, InteractionCreate
from sqlalchemy.orm import Session

from wugserver.schema.message import MessageCreate
from wugserver.schema.message_role import MessageRole


def post_message_to_openai(db: Session, interactionId: UUID, messageCreate: MessageCreate):
  currentMessages = get_interaction_messages(db=db, interactionId=interactionId)
  curIndex = max([message.offset for message in currentMessages], default=0)
  userMessage = create_message(db=db, interactionId=interactionId, role=MessageRole.user, content=messageCreate.content, offset=++curIndex)
  response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages= [internalMessage.toOpenaiMessage() for internalMessage in currentMessages] + [userMessage.toOpenaiMessage()]
  )
  responseMessage = response['choices'][0]['message']['content']
  return create_message(db=db, interactionId=interactionId, role=MessageRole.system, content=responseMessage, offset=++curIndex)

