
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
        prompts = example_prompt_model.sample_example_prompts_by_type(
            count=count,
            _type=type,
        )
    else:
        prompts = example_prompt_model.sample_example_prompts(count=count)
    return [Prompt(content=p.content) for p in prompts]
