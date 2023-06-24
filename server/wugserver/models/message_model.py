from fastapi import Depends
from wugserver.models.db.message_db_model import MessageDbModel
from wugserver.models.db.interaction_model import InteractionRecord


class MessageModel:
    def __init__(
        self, message_db_model: MessageDbModel = Depends(MessageDbModel)
    ) -> None:
        self.message_db_model = message_db_model

    def get_interaction_messages(
        self,
        interaction: InteractionRecord,
        offset: int,
        limit: int,
        from_latest: bool = True,
    ):
        return self.message_db_model.get_interaction_messages(
            interaction.id, offset, limit, from_latest
        )

    def create_message(self, interaction: InteractionRecord, source: str, message: str):
        return self.message_db_model(interaction.id, source, message)

    def get_interaction_last_message(self, interaction: InteractionRecord):
        last_message_in_list = self.get_interaction_messages(interaction, 0, 1, True)
        return last_message_in_list[0] if last_message_in_list else None

    def get_interaction_all_messages(self, interaction: InteractionRecord):
        return self.get_interaction_messages(interaction, 0, 100000, False)
