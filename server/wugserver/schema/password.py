from pydantic import BaseModel, validator
from wugserver.types.validators.email_validator import is_valid_email
from wugserver.types.validators.password_validator import is_valid_password


class PasswordUpdate(BaseModel):
    new_password: str

    @validator("new_password", each_item=True)
    def check_new_password(cls, pwd) -> bool:
        assert is_valid_password(pwd), f"{pwd} did not meet requirements"
        return pwd


class InitiatePasswordReset(BaseModel):
    email: str

    @validator("email", each_item=True)
    def check_email(cls, email):
        if email:
            assert is_valid_email(email), f"{email} is not a valid email"
            return email


class PasswordReset(PasswordUpdate):
    token: str
