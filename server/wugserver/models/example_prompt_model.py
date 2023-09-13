from fastapi import Depends
from wugserver.models.db.example_prompt_db_model import ExamplePromptDbModel
from wugserver.schema.prompt import PromptTypes

class ExamplePromptModel:
    def __init__(
        self,
        example_prompt_db_model: ExamplePromptDbModel = Depends(ExamplePromptDbModel)
    ):
        self.example_prompt_db_model = example_prompt_db_model
    
    def sample_example_prompts(self, count: int):
        return self.example_prompt_db_model.sample_example_prompts(count=count)

    def sample_example_prompts_by_type(self, count: int, _type: PromptTypes):
        return self.example_prompt_db_model.sample_example_prompts_by_type(
            count=count,
            _type=_type,
        )
