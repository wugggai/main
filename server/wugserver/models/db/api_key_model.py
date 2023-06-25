import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Session
from wugserver.database import Base
from wugserver.schema.api_key import ApiKeyCreate
from wugserver.schema.user import *


# DB Schema
class ApiKeyModel(Base):
    __tablename__ = "apikeys"

    owner_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    provider = Column(String(32), primary_key=True)
    api_key = Column(String(128))
    created = Column(DateTime, default=datetime.datetime.utcnow())


# TODO: For best user experience, validate the API key
def create_api_key_record(
    db: Session, user_id: int, provider: str, api_key_create: ApiKeyCreate
):
    db_api_key = ApiKeyModel(
        owner_user_id=user_id, provider=provider, api_key=api_key_create.api_key
    )
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    return db_api_key


def update_api_key_record(
    db: Session, user_id: int, provider: str, api_key_create: ApiKeyCreate
):
    db_api_key = get_user_api_key_for_provider(
        db=db, user_id=user_id, provider=provider
    )
    db_api_key.api_key = api_key_create.api_key
    db.commit()
    db.refresh(db_api_key)
    return db_api_key


def get_user_api_key_for_provider(db: Session, user_id: int, provider: str):
    return (
        db.query(ApiKeyModel)
        .filter(
            ApiKeyModel.owner_user_id == user_id and ApiKeyModel.provider == provider
        )
        .first()
    )


def get_all_user_api_keys(db: Session, user_id: int):
    return db.query(ApiKeyModel).filter(ApiKeyModel.owner_user_id == user_id).all()


def obfuscate_api_key(key: str):
    if key is None:
        return key
    # API Keys are generally longer than 7 chars
    if len(key) <= 7:
        return key
    return key[:5] + '*' * (len(key) - 7) + key[-2:]
