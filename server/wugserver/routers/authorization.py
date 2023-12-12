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

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from wugserver.models.interaction_model import InteractionModel
from wugserver.models.tag_model import TagModel


def authorize_by_matching_user_id(current_user_id: int, user_id: int):
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail=f"user is not {user_id}")


def authorized_get_interaction(
    current_user_id: int,
    interaction_id: UUID,
    include_deleted: bool = True,
    interaction_model: InteractionModel = Depends(InteractionModel),
):
    interaction = interaction_model.get_interaction_by_id(
        interaction_id=interaction_id,
        include_deleted=include_deleted,
    )
    # 403 is returned instead of 404 if a nonexisting resource is requested
    # so that an unauthorized user cannot gain information from the call
    if interaction is None:
        raise HTTPException(
            status_code=403, detail=f"user cannot access interaction {interaction_id}"
        )
    authorize_by_matching_user_id(
        current_user_id=current_user_id,
        user_id=interaction_model.get_interaction_owner(interaction=interaction),
    )
    return interaction


def authorized_get_tag(
    current_user_id: int,
    tag_id: UUID,
    tag_model: TagModel = Depends(TagModel)
):
    tag = tag_model.get_tag_by_id(tag_id=tag_id)
    if tag is None:
        raise HTTPException(status_code=403, detail=f"user cannot access tag {tag_id}")
    authorize_by_matching_user_id(
        current_user_id=current_user_id,
        user_id=tag_model.get_tag_owner(tag=tag),
    )
    return tag
