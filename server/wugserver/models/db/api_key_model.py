from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from sqlalchemy.orm import Session
from wugserver.database import Base
from wugserver.models.db.user_password_model import create_user_password
from wugserver.schema.api_key import ApiKeyBase, ApiKeyCreate
from wugserver.schema.user import *

# DB Schema
class ApiKeyModel(Base):
  __tablename__ = "apikeys"

  owner_user_id = Column(Integer, primary_key=True)
  provider = Column(String, primary_key=True)
  api_key = Column(String)
  created = Column(DateTime, server_default=func.now())

def create_api_key_record(db: Session, user_id: int, provider: str, api_key_create: ApiKeyCreate):
  db_api_key = ApiKeyModel(owner_user_id = user_id, provider = provider, api_key = api_key_create.api_key)
  db.add(db_api_key)
  db.commit()
  db.refresh(db_api_key)
  return db_api_key

def update_api_key_record(db: Session, user_id: int, provider: str, api_key_create: ApiKeyCreate):
  db_api_key = get_user_api_key_for_provider(db, user_id, provider)
  db_api_key.api_key = api_key_create.api_key
  db.commit()
  db.refresh(db_api_key)
  return db_api_key

def get_user_api_key_for_provider(db: Session, user_id: int, provider: str):
  return db.query(ApiKeyModel).filter(ApiKeyModel.owner_user_id == user_id and ApiKeyModel.provider == provider).first()
