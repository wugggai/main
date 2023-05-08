from sqlalchemy import Column, ForeignKey, Integer, Table, Uuid
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from uuid import UUID

from wugserver.database import Base

interaction_tag_association_table = Table(
    "interaction_tag_association",
    Base.metadata,
    Column("interaction", Uuid, ForeignKey("interactions.id"), primary_key=True),
    Column("tag", Uuid, ForeignKey("tags.id"), primary_key=True),
)
