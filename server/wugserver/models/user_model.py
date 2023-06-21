from fastapi import Depends
from wugserver.models.db.user_db_model import UserDbModel, UserRecord
from wugserver.schema.user import UserCreate


class UserModel:
    def __init__(
        self,
        user_db_model: UserDbModel = Depends(UserDbModel),
    ):
        self.user_db_model = user_db_model

    def create_db_user(self, user: UserCreate):
        created_user = self.user_db_model.create_db_user(user)
        return created_user

    def get_user_by_email(self, email: str):
        return self.user_db_model.get_user_by_email(email)

    def activate_user(self, user_record: UserRecord):
        self.user_db_model.activate_user(user_record)
