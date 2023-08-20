from datetime import datetime
import json
from fastapi import Depends, HTTPException
from wugserver.models.db.user_forget_password_db_model import UserForgetPasswordDbModel
from wugserver.models.db.user_password_db_model import UserPasswordDbModel
from passlib.context import CryptContext
from wugserver.models.external.sendgrid import send_password_reset_email
from wugserver.models.user_model import UserModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
PASSWORD_RESET_EXPIRATION_DELTA_IN_SECONDS = 15 * 60 * 60


class UserPasswordModel:
    def __init__(
        self,
        user_model: UserModel = Depends(UserModel),
        user_password_db_model: UserPasswordDbModel = Depends(UserPasswordDbModel),
        user_forget_password_db_model: UserForgetPasswordDbModel = Depends(
            UserForgetPasswordDbModel
        ),
    ):
        self.user_model = user_model
        self.user_password_db_model = user_password_db_model
        self.user_forget_password_db_model = user_forget_password_db_model

    def create_user_password(self, user_id: int, password: str):
        hashed_password = pwd_context.hash(password)
        return self.user_password_db_model.create_user_password(
            user_id, hashed_password
        )

    def get_user_hashed_password(self, user_id: int):
        return self.user_password_db_model.get_user_hashed_password(user_id)

    def verify_user_password(self, user_id: int, raw_password: str):
        result = self.get_user_hashed_password(user_id)
        return result and pwd_context.verify(raw_password, result.hashed_password)

    def patch_user_password(self, user_id: int, new_password: str):
        if verify_user_password(user_id, new_password):
            raise HTTPException(
                status_code=400, detail=f"Please provide a different password"
            )
        new_hashed_password = pwd_context.hash(new_password)
        self.user_password_db_model.update_user_password(user_id, new_hashed_password)

    def initiate_password_reset(self, email: str):
        user = self.user_model.get_user_by_email(email)
        if not user:
            return
        secret_record = (
            self.user_forget_password_db_model.create_forget_password_secret(user.id)
        )
        res = send_password_reset_email(email, secret_record.secret)
        if not 200 <= int(res.status_code) <= 299:
            res_json = json.loads(res.body)
            raise HTTPException(
                status_code=500,
                detail=f"Could not send verification email to {user.email}: {res_json['errors']}",
            )

    def complete_password_reset(self, token: str, new_password: str):
        forget_password_record = (
            self.user_forget_password_db_model.get_record_from_secret(token)
        )
        if forget_password_record:
            self._assert_password_reset_valid(forget_password_record.requested)
            hashed_password = pwd_context.hash(new_password)
            self.user_password_db_model.update_user_password(
                forget_password_record.user_id, hashed_password
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid reset token")

    def _assert_password_reset_valid(self, initiated: datetime):
        try:
            something = int((datetime.utcnow() - initiated).total_seconds())
            print(something)
            assert (
                int((datetime.utcnow() - initiated).total_seconds())
                < PASSWORD_RESET_EXPIRATION_DELTA_IN_SECONDS
            )
        except Exception as exc:
            raise HTTPException(
                status_code=400, detail="Password reset has expired"
            ) from exc
