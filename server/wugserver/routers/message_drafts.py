from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from wugserver.models.db.user_db_model import UserRecord
from wugserver.models.message_draft_model import MessageDraftModel
from wugserver.models.user_authentication import get_current_active_user
from wugserver.routers.authorization import (
    authorize_by_matching_user_id,
    authorize_message_draft,
)
from wugserver.schema.message_draft import MessageDraft, MessageDraftCreate

router = APIRouter()


@router.post("/users/{user_id}/message/drafts", response_model=MessageDraft)
def create_message_draft_route(
    user_id: int,
    message_draft_create: MessageDraftCreate,
    current_user: UserRecord = Depends(get_current_active_user),
    message_draft_model: MessageDraftModel = Depends(MessageDraftModel),
):
    authorize_by_matching_user_id(current_user_id=current_user.id, user_id=user_id)
    record = message_draft_model.create_draft(user_id, message_draft_create.draft)
    return record


@router.patch("/message/drafts/{id}", status_code=200)
def update_message_draft_route(
    id: UUID,
    message_draft_create: MessageDraftCreate,
    current_user: UserRecord = Depends(get_current_active_user),
    message_draft_model: MessageDraftModel = Depends(MessageDraftModel),
):
    record = message_draft_model.get_draft(id)
    if record == None:
        raise HTTPException(404, "Draft doesn't exist")
    authorize_message_draft(current_user.id, record)
    message_draft_model.update_record(id, message_draft_create.draft)


@router.get("/users/{user_id}/message/drafts", response_model=list[MessageDraft])
def get_user_message_drafts_route(
    user_id: int,
    current_user: UserRecord = Depends(get_current_active_user),
    message_draft_model: MessageDraftModel = Depends(MessageDraftModel),
):
    authorize_by_matching_user_id(current_user_id=current_user.id, user_id=user_id)
    return message_draft_model.get_user_drafts(user_id)


@router.get("/message/drafts/{id}", response_model=MessageDraft)
def get_draft_route(
    id: UUID,
    current_user: UserRecord = Depends(get_current_active_user),
    message_draft_model: MessageDraftModel = Depends(MessageDraftModel),
):
    record = message_draft_model.get_draft(id)
    if record == None:
        raise HTTPException(404, "Draft doesn't exist")
    authorize_message_draft(current_user.id, record)
    return record


@router.delete("/message/drafts/{id}")
def delete_draft_route(
    id: UUID,
    current_user: UserRecord = Depends(get_current_active_user),
    message_draft_model: MessageDraftModel = Depends(MessageDraftModel),
):
    record = message_draft_model.get_draft(id)
    if record == None:
        raise HTTPException(404, "Draft doesn't exist")
    authorize_message_draft(current_user.id, record)
    message_draft_model.delete_draft(id)
