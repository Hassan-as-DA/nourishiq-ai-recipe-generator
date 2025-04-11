import requests
import json

from .utils import get_ingredients_list
from .prompts import GENERATE_PROMPT_SUGGESTIONS_TEMPLATE, REFINE_RECIPE_PROMPT_TEMPLATE

OLLAMA_API_URL = "http://localhost:11434/api/generate"
MISTRAL_MODEL = "mistral:latest"


VALIDATE_INPUT_PROMPT_TEMPLATE = """
<System>
You are a strict classifier that decides whether a user prompt is meant for recipe generation.

Strictly follow these rules:
- Return only a json object having one key value strictly: with key as "result" and values either "valid" or "invalid".
- Only return "valid" if the prompt clearly asks for a recipe or food preparation idea.
- Lazy prompts like "what's for dinner?" or "quick meal idea" are also valid if they imply food/recipe intent.
- Do not consider unrelated, gibberish, or off-topic prompts as valid.
- Only respond in lowercase for values: "valid" or "invalid". make sure to have the key "result" in json object. both key and value will be of type string or text.
- Do not explain or output anything else stictly.
- Example output be like: {{ "result": "valid" }} or {{ "result": "invalid" }}

<User>
### INPUT START ###
User prompt:
{user_prompt}
### INPUT END ###
"""

def validate_user_prompt(user_prompt: str) -> dict:
    payload = {
        "model": MISTRAL_MODEL,
        "prompt": VALIDATE_INPUT_PROMPT_TEMPLATE.format(
            user_prompt=user_prompt,
        ),
        "stream": False,
    }

    try:
        print("Validating user prompt using Mistral 7b model...")
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        data = response.json()

        print("Validated user prompt using Mistral 7b model.")
        refined_json = data["response"].strip()
        parsed = json.loads(refined_json)
        print(json.dumps(parsed, indent=2))

        return json.loads(refined_json)

    except Exception as e:
        print("Error validating user prompt:", e)
        return {}

def generate_prompt_suggestions() -> list:
    ingredients = get_ingredients_list()
    payload = {
        "model": MISTRAL_MODEL,
        "prompt": GENERATE_PROMPT_SUGGESTIONS_TEMPLATE.format(
            ingredients=ingredients,
        ),
        "stream": False,
    }
    try:
        print("Requesting prompt suggestions from Mistral 7b model...")
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        suggestions_str = data["response"].strip()
        print(suggestions_str)
        # The response should be a stringified list, e.g., '["prompt1", "prompt2", "prompt3"]'
        suggestions = json.loads(suggestions_str)
        print("Received suggestions:", suggestions)
        return suggestions

    except Exception as e:
        print("Error generating prompt suggestions:", e)
        return []

def refine_recipe(
    logger: None, user_prompt: str, draft_recipe: dict, current_ingredients: list
) -> dict:
    draft_recipe_str = json.dumps(draft_recipe, indent=2)
    print(f"User prompt was: {user_prompt}")
    print(
        "PROMPT TEMPLATE: ",
        REFINE_RECIPE_PROMPT_TEMPLATE.format(
            user_prompt=user_prompt,
            draft_recipe=draft_recipe_str,
            ingredients=current_ingredients,
        ),
    )
    payload = {
        "model": MISTRAL_MODEL,
        "prompt": REFINE_RECIPE_PROMPT_TEMPLATE.format(
            user_prompt=user_prompt,
            draft_recipe=draft_recipe_str,
            ingredients=current_ingredients,
        ),
        "stream": False,
    }

    try:
        logger.info("Generating refined recipe using Mistral 7b model...")
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        data = response.json()

        refined_json = data["response"].strip()
        parsed = json.loads(refined_json)
        logger.info(json.dumps(parsed, indent=2))
        logger.info("Successfully generated refined recipe using Mistral 7b model.")

        time_taken_in_seconds = int(data["eval_duration"]) / 1_000_000_000
        logger.info(f"Total time taken: {time_taken_in_seconds} seconds.")

        return json.loads(refined_json)

    except Exception as e:
        logger.error("Error refining recipe:", e)
        return {}
