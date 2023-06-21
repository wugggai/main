from fastapi import HTTPException
from functools import wraps
from typing import Callable, List

# NOTE: All router functions must call db operations with kwargs
#       If there's reason to use positional arguments, update auth functions accordingly


# pre_authorization_wrapper_helper: builds authorization wrapper for different resource types
# A "pre-authorization" checks function parameters before entering function logic
def pre_authorization_wrapper_helper(
    db_func: Callable, get_owner_ids_from_kwargs_func: Callable
):
    @wraps(db_func)
    def wrapper(*args, **kwargs):
        current_user_id = kwargs.get("current_user_id")
        owner_ids = get_owner_ids_from_kwargs_func(kwargs)
        if not is_authorized(owner_ids, current_user_id):
            raise HTTPException(status_code=403)
        kwargs.pop("current_user_id")
        return db_func(*args, **kwargs)

    return wrapper


def authorize_by_res_owner_id(db_func: Callable):
    def get_owner_ids_from_params(kwargs):
        if kwargs.get("user_id"):
            return [kwargs.get("user_id")]
        if kwargs.get("creator_user_id"):
            return [kwargs.get("creator_user_id")]
        raise HTTPException(status_code=500)

    return pre_authorization_wrapper_helper(
        db_func, lambda kwargs: get_owner_ids_from_params(kwargs)
    )


# authorization_post_check_helper:
# A "post-authorization" checks an object's property after it's fetched from db
def post_authorization_wrapper_helper(
    db_func: Callable, get_owner_ids_from_fetched_object: Callable
):
    @wraps(db_func)
    def wrapper(*args, **kwargs):
        current_user_id = kwargs.pop("current_user_id")
        fetched_obj = db_func(*args, **kwargs)
        owner_ids = get_owner_ids_from_fetched_object(fetched_obj)
        if not is_authorized(owner_ids, current_user_id):
            raise HTTPException(status_code=403)
        return fetched_obj

    return wrapper


def authorize_get_tag_from_db(db_func: Callable):
    return post_authorization_wrapper_helper(
        db_func, lambda tag: [tag.creator_user_id] if tag else None
    )


def authorize_get_tags_from_db(db_func: Callable):
    return post_authorization_wrapper_helper(
        db_func,
        lambda tags: list(set([tag.creator_user_id for tag in tags])) if tags else [],
    )


def authorize_get_interaction_from_db(db_func: Callable):
    return post_authorization_wrapper_helper(
        db_func,
        lambda interaction: [interaction.creator_user_id] if interaction else None,
    )


# Define authorization policy here
# Requested resource(s) may be owned by more than one user, for now we expect only one
def is_authorized(owner_ids: List[int], current_user_id: int):
    return not owner_ids or (len(owner_ids) == 1 and owner_ids[0] == current_user_id)
