from typing import Optional
from fastapi import Depends
from sqlalchemy import UUID
from wugserver.models.db.message_db_model import MessageDbModel, MessageRecord
from wugserver.models.db.interaction_model import InteractionRecord
from wugserver.models.db.message_favorite_db_model import MessageFavoriteDbModel
from wugserver.schema.message import Message, MultiMediaContent


class MessageModel:
    def __init__(
        self,
        message_db_model: MessageDbModel = Depends(MessageDbModel),
        message_favorite_db_model: MessageFavoriteDbModel = Depends(
            MessageFavoriteDbModel
        ),
    ) -> None:
        self.message_db_model = message_db_model
        self.message_favorite_db_model = message_favorite_db_model

    def get_interaction_messages(
        self,
        interaction: InteractionRecord,
        offset: int,
        limit: int,
        from_latest: bool = True,
    ) -> list[Message]:
        raw_messages_records = self.message_db_model.get_interaction_messages(
            interaction.id, offset, limit, from_latest
        )
        return [
            Message(
                id=raw_message.id,
                interaction_id=raw_message.interaction_id,
                source=raw_message.source,
                offset=raw_mesaage.offset,
                timestamp=raw_message.timestamp,
                favorited_by=raw_mesaage.favorite_by,
                message=[
                    MultiMediaContent(
                        type=content_record.type,
                        content=content_record.content,
                    )
                    for content_record in sorted(raw_message.message, key=lambda r: r.order)
                ],
            )
            for raw_message in raw_messages_records
        ]

    def create_message(
        self,
        interaction: InteractionRecord,
        source: str,
        message: list[MultiMediaContent],
    ):
        message_content_records = [
            self.message_db_model.create_message_content_record(
                type=record.type,
                content=record.content,
                order=index,
            )
            for index, record in enumerate(message)
        ]

        return self.message_db_model.create_message(
            interaction_id=interaction.id,
            source=source,
            message_content=message_content_records,
        )

    def get_interaction_last_message(self, interaction: InteractionRecord):
        last_message_in_list = self.get_interaction_messages(interaction, 0, 1, True)
        return last_message_in_list[0] if last_message_in_list else None

    def get_interaction_all_messages(self, interaction: InteractionRecord):
        return self.get_interaction_messages(interaction, 0, 100000, False)

    def create_favorite_message_for_user(self, user_id: int, message_id: UUID):
        return self.message_favorite_db_model.create_message_favorite(
            user_id, message_id
        )

    def get_favorite_messages_for_user(self, user_id: int):
        return [
            favorite_record.message
            for favorite_record in self.message_favorite_db_model.get_favorite_messages_by_user(
                user_id
            )
        ]

    def delete_favorite_message_for_user(self, user_id: int, message_id: UUID):
        return self.message_favorite_db_model.delete_message_favorite(
            user_id, message_id
        )
