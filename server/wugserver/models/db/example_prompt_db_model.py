from fastapi import Depends
from sqlalchemy import func, Column, Enum, Integer, Text, Uuid
from sqlalchemy.orm import Session
from wugserver.database import Base
from wugserver.dependencies import get_db
from wugserver.schema.prompt import PromptTypes

class ExamplePromptRecord(Base):
    __tablename__ = "example_prompt"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(Enum(PromptTypes), index=True)
    content = Column(Text)

class ExamplePromptDbModel:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def sample_example_prompts(
        self,
        count: int,
    ):
        return self.db.query(ExamplePromptRecord) \
            .order_by(func.random()) \
            .limit(count) \
            .all()

    def sample_example_prompts_by_type(
        self,
        count: int,
        _type: PromptTypes,
    ):
        return self.db.query(ExamplePromptRecord) \
            .filter(ExamplePromptRecord.type == _type) \
            .order_by(func.random()) \
            .limit(count) \
            .all()
