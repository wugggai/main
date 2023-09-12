
from fastapi import APIRouter, Depends
from wugserver.models.example_prompt_model import ExamplePromptModel
from wugserver.schema.prompt import Prompt, PromptTypes

router = APIRouter()

@router.get("/example_prompts", response_model=list[Prompt])
def get_random_prompts(
    count: int = 3,
    type: PromptTypes = None,
    example_prompt_model: ExamplePromptModel = Depends(ExamplePromptModel),
):
    if type:
        return example_prompt_model.sample_example_prompts_by_type(
            count=count,
            _type=type,
        )
    return example_prompt_model.sample_example_prompts(count=count)
