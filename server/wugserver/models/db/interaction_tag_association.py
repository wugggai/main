from sqlalchemy import Column, ForeignKey, Table, Uuid
from sqlalchemy.ext.declarative import declarative_base

from wugserver.database import Base

interaction_tag_association_table = Table(
    "interaction_tag_association",
    Base.metadata,
    Column("interaction", Uuid, ForeignKey("interactions.id", ondelete="CASCADE"), primary_key=True),
    Column("tag", Uuid, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)
