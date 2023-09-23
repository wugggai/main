import requests

from wugserver.models.ai_models.abstract_model import AIModel
from wugserver.models.db.message_db_model import MessageRecord
from wugserver.schema.message import (
    Message,
    MessageCreate,
    MessageSegment,
    MessageTypes,
)
from wugserver.constants import Provider


class StableDiffusionModel(AIModel):
    provider = Provider.stable_diffusion


# StableDiffusionT2IModel: free stable diffusion API and Dreambooth community models
class StableDiffusionT2IModel(StableDiffusionModel):
    @classmethod
    def requires_context(cls) -> bool:
        return False

    @classmethod
    def assert_input_format(cls, message_create_params: MessageCreate):
        message = message_create_params.message
        # StableDiffusion T2I models accepts 1 prompt (text) and 1 optional negative prompt (text)
        if not (
            1 <= len(message) <= 2
            and all([seg.type == MessageTypes.text for seg in message])
        ):
            raise ValueError(
                "Stable Diffusion Text to Image model requires 1 or 2 text input prompt"
            )

    def post_message(
        self,
        api_key: str,
        interaction_context: list[MessageRecord],
        message_create_params: MessageCreate,
    ):
        message = message_create_params.message
        prompt = message[0].content
        negative_prompt = ""
        if len(message) == 2:
            negative_prompt = message[1].content
        model_config = message_create_params.model_config
        image_urls = self.make_api_request(
            api_key=api_key,
            prompt=prompt,
            negative_prompt=negative_prompt,
            model_config=model_config,
        )
        return self.wrap_image_message(image_urls)


class StableDiffusionV3T2IModel(StableDiffusionT2IModel):
    supported_model_names = ["stable-diffusion-v3"]

    @classmethod
    def get_user_models_list(cls, key: str):
        return cls.supported_model_names

    def make_api_request(
        self,
        api_key: str,
        prompt: str,
        negative_prompt: str,
        model_config: dict,
    ) -> str:
        req_params = {
            "key": api_key,
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": model_config.get("width", 512),
            "height": model_config.get("height", 512),
            "samples": model_config.get("samples", 4),
            "num_inference_steps": model_config.get("num_inference_steps", 20),
            "seed": model_config.get("seed", None),
            "guidance_scale": model_config.get("guidance_scale", 7.5),
            "safety_checker": model_config.get("safety_checker", "yes"),
            "multi_lingual": model_config.get("multi_lingual", "yes"),
            "panorama": model_config.get("panorama", "no"),
            "self_attention": model_config.get("self_attention", "no"),
            "upscale": model_config.get("upscale", "no"),
        }
        res = requests.post(
            url="https://stablediffusionapi.com/api/v3/text2img",
            data=req_params,
        )
        return res.json()["output"]


class DreamboothT2IModel(StableDiffusionT2IModel):
    model_id = ""
    model_name = ""

    @property
    def supported_model_names(self) -> list[str]:
        return [self.model_name]

    @classmethod
    def get_user_models_list(cls, key: str):
        return [cls.model_name]

    @classmethod
    def get_model_id(cls, model_name: str) -> str:
        return cls.model_id

    def make_api_request(
        self,
        api_key: str,
        prompt: str,
        negative_prompt: str,
        model_config: dict,
    ) -> str:
        req_params = {
            "key": api_key,
            "model_id": self.model_id,
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": model_config.get("width", 512),
            "height": model_config.get("height", 512),
            "samples": model_config.get("samples", 4),
            "num_inference_steps": model_config.get("num_inference_steps", 20),
            "seed": model_config.get("seed", None),
            "enhance_prompt": model_config.get("enhance_prompt", "yes"),
            "safety_checker": model_config.get("safety_checker", "yes"),
            "guidance_scale": model_config.get("guidance_scale", 7.5),
            "multi_lingual": model_config.get("multi_lingual", "yes"),
            "panorama": model_config.get("panorama", "no"),
            "self_attention": model_config.get("self_attention", "no"),
            "upscale": model_config.get("upscale", "no"),
        }
        res = requests.post(
            url="https://stablediffusionapi.com/api/v4/dreambooth",
            data=req_params,
        ).json()
        if "output" in res:
            return res["output"]
        raise Exception(res["message"])


class DreamboothMidJourneyT2IModel(DreamboothT2IModel):
    model_id = "midjourney"
    model_name = "midjourney-v4"


class DreamboothAnythingT2IModel(DreamboothT2IModel):
    model_id = "anything-v5"
    model_name = "anything-v5"


class DreamboothRealisticVisionT2IModel(DreamboothT2IModel):
    model_id = "realistic-vision-v13"
    model_name = "realistic-vision-v1.3"


def all_dreambooth_models():
    return [
        DreamboothMidJourneyT2IModel(),
        DreamboothAnythingT2IModel(),
        DreamboothRealisticVisionT2IModel(),
    ]
