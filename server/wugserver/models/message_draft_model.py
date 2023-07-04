from uuid import UUID
from fastapi import Depends

from wugserver.models.db.message_draft_db_model import (
    MessageDraftDbModel,
    MessageDraftRecord,
)


class MessageDraftModel:
    def __init__(
        self, message_draft_db_model: MessageDraftDbModel = Depends(MessageDraftDbModel)
    ) -> None:
        self.message_draft_db_model = message_draft_db_model

    def create_draft(self, user_id: int, draft: str):
        return self.message_draft_db_model.create_draft(user_id, draft)

    def update_record(self, id: UUID, new_draft: str):
        self.message_draft_db_model.update_record(id, new_draft)

    def get_user_drafts(self, user_id: int):
        return self.message_draft_db_model.get_user_drafts(user_id)

    def get_draft(self, id: UUID) -> MessageDraftRecord | None:
        return self.message_draft_db_model.get_draft(id)

    def delete_draft(self, id: UUID) -> MessageDraftRecord | None:
        return self.message_draft_db_model.delete_draft(id)
