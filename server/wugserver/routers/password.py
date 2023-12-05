from fastapi import APIRouter, Depends, HTTPException, Request
from wugserver.models.db.user_db_model import UserRecord
from wugserver.models.user_authentication import get_current_active_user
from wugserver.models.user_password_model import UserPasswordModel
from wugserver.schema.password import (
    InitiatePasswordReset,
    PasswordReset,
    PasswordUpdate,
)

router = APIRouter()


@router.patch("/users/{user_id}/password")
def patch_user_password_route(
    password_update: PasswordUpdate,
    user_id: int,
    current_user: UserRecord = Depends(get_current_active_user),
    user_password_model: UserPasswordModel = Depends(UserPasswordModel),
):
    authorize_by_matching_user_id(current_user.id, user_id)
    user_password_model.patch_user_password(
        current_user.id, password_update.new_password
    )


@router.put("/users/resetpassword")
def patch_user_password_route(
    password_reset: PasswordReset,
    user_password_model: UserPasswordModel = Depends(UserPasswordModel),
):
    user_password_model.complete_password_reset(
        password_reset.token, password_reset.new_password
    )


@router.post("/users/forgetpassword")
def post_user_forget_password(
    initiate_password_reset: InitiatePasswordReset,
    user_password_model: UserPasswordModel = Depends(UserPasswordModel),
):
    try:
        user_password_model.initiate_password_reset(initiate_password_reset.email)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=e,
        )
