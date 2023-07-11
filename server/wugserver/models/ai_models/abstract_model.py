from abc import abstractmethod
from sqlalchemy.orm import Session
from typing import Any

from wugserver.models.db.api_key_model import get_user_api_key_for_provider
from wugserver.schema.message import MessageCreate, MessageSegment, MessageTypes
from wugserver.constants import Provider


class AIModel(object):
    provider: Provider
    supported_model_names: list[str]

    def post_message(
        self,
        api_key: Any,
        interaction_context: Any,
        message_create_params: MessageCreate,
    ):
        """
        sends messages to an AI model
        Parameters:
        api_key               (Any):           API key or other credential required by AI model
        interaction_context   (Any):           Necessary context from the interaction required by the model
        message_create_params (MessageCreate): parameters of mesesage creation

        Returns:
        string: AI model's response
        """
        pass

    def get_provider(self) -> Provider:
        return self.provider

    def get_user_api_key(self, db: Session, user_id: int) -> str:
        return get_user_api_key_for_provider(
            db=db, user_id=user_id, provider=self.provider
        )

    @classmethod
    def get_user_models_list(cls, key: str) -> list[str]:
        return []

    @classmethod
    def requires_context(cls) -> bool:
        return False

    @abstractmethod
    def assert_input_format(cls, message_create_params: MessageCreate):
        pass

    @classmethod
    def wrap_text_message(cls, message: str | list[str]):
        return cls.wrap_message(
            message=message,
            type=MessageTypes["text"],
        )

    @classmethod
    def wrap_image_message(cls, message: str | list[str]):
        return cls.wrap_message(
            message=message,
            type=MessageTypes["image_url"],
        )

    @classmethod
    def wrap_message(cls, message: str | list[str], type: MessageTypes):
        if isinstance(message, str):
            message = [message]

        res = []
        for seg in message:
            res.append(
                MessageSegment(
                    type=type,
                    content=seg,
                )
            )
        return res
