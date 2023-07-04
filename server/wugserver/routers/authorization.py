"""
authorization.py: defines resource access control rules
Currently only permits resource to be accessed by owner/creator


Resource Level Access Control Policy
To implement resource level access control, replace authorize_by_matching_user_id calls in router functions
  with "authorized_get_<res>_by_user_id" functions implemented for each resource type

Example: User A allows user B to access A's interactions, but not A's API keys
  authorized_get_interactions_by_user_id will allow B's access
  where authorized_get_api_key_by_user_id will not

Similarly, READ and WRITE access may be segregated by defining separate authorization functions


Trust Context Isolation
We'll enforce below trust context isolation on the code level:
- all functions under /models/db assume the caller has been authorized
- when router function becomes too complicated, create new "controller" files
  router and controller functions cannot assume the use has been authorized

In other words, all authorization happens on the controller level, or under /routers in practice
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from wugserver.models.db.interaction_model import (
    get_interaction_by_id,
    get_interaction_owner,
)
from wugserver.models.db.message_draft_db_model import MessageDraftRecord
from wugserver.models.db.tag_model import get_tag_by_id, get_tag_owner


def authorize_by_matching_user_id(current_user_id: int, user_id: int):
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail=f"user is not {user_id}")


def authorize_message_draft(user_id: int, message_draft_record: MessageDraftRecord):
    if user_id != message_draft_record.user_id:
        raise HTTPException(
            status_code=403, detail=f"user cannot access {message_draft_record.id}"
        )


def authorized_get_interaction(
    db: Session,
    current_user_id: int,
    interaction_id: UUID,
    include_deleted: bool = True,
):
    interaction = get_interaction_by_id(
        db=db, interaction_id=interaction_id, include_deleted=include_deleted
    )
    # 403 is returned instead of 404 if a nonexisting resource is requested
    # so that an unauthorized user cannot gain information from the call
    if interaction is None:
        raise HTTPException(
            status_code=403, detail=f"user cannot access interaction {interaction_id}"
        )
    authorize_by_matching_user_id(
        current_user_id=current_user_id,
        user_id=get_interaction_owner(interaction=interaction),
    )
    return interaction


def authorized_get_tag(db: Session, current_user_id: int, tag_id: UUID):
    tag = get_tag_by_id(db=db, tag_id=tag_id)
    if tag is None:
        raise HTTPException(status_code=403, detail=f"user cannot access tag {tag_id}")
    authorize_by_matching_user_id(
        current_user_id=current_user_id,
        user_id=get_tag_owner(db=db, tag=tag),
    )
    return tag
