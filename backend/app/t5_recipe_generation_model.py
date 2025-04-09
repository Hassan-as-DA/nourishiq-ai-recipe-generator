from transformers import AutoTokenizer, FlaxAutoModelForSeq2SeqLM
from typing import Union, List, Dict

from .schemas import Recipe
from .utils import (
    shuffle_ingredients,
    get_ingredients_list,
    generate_from_existing_ingredients,
)
from .extract_ingredients import extract_ingredients_from_prompt
from .mistral_7b_model import refine_recipe

MODEL_NAME = "flax-community/t5-recipe-generation"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=True)
model = FlaxAutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

prefix = "items: "

generation_kwargs = {
    "do_sample": True,
    "temperature": 1.3,
    "top_k": 50,
    "top_p": 0.92,
    "repetition_penalty": 1.2,
    "num_return_sequences": 1,
    "max_length": 512,
    "min_length": 120,
    "length_penalty": 1.0,
    "return_dict_in_generate": True,
}

special_tokens = tokenizer.all_special_tokens
# special_tokens = ["<sep>", "<section>", "</s>", "<pad>"]

tokens_map = {"<sep>": "--", "<section>": "\n"}


def skip_special_tokens(text: str, special_tokens: List[str]) -> str:
    for token in special_tokens:
        text = text.replace(token, "")
    return text.strip()


def parse_recipe(text: str) -> Dict[str, Union[str, List[str]]]:
    recipe = {"title": "", "ingredients": [], "directions": []}

    text = skip_special_tokens(text, special_tokens)
    for k, v in tokens_map.items():
        text = text.replace(k, v)

    sections = text.split("\n")
    current_section = None

    for section in sections:
        section = section.strip()
        if section.startswith("title:"):
            current_section = "title"
            recipe["title"] = section.replace("title:", "").strip()
        elif section.startswith("ingredients:"):
            current_section = "ingredients"
            items = section.replace("ingredients:", "").split("--")
            recipe["ingredients"] = [item.strip() for item in items if item.strip()]
        elif section.startswith("directions:"):
            current_section = "directions"
            steps = section.replace("directions:", "").split("--")
            recipe["directions"] = [step.strip() for step in steps if step.strip()]
        elif current_section and section:
            # Additional lines for the current section
            if current_section == "title":
                recipe["title"] += " " + section
            else:
                parts = section.split("--")
                recipe[current_section].extend([p.strip() for p in parts if p.strip()])

    return recipe


def t5_recipe_generation_model(
    logger: None, user_prompt: str, num_of_recipes: int = 1
) -> List[Recipe]:
    try:
        # prompts = get_prompt_variants(ingredients, num_of_recipes)
        logger.info("Retrieving current ingredients list.")
        current_ingredients = get_ingredients_list()
        logger.info(f"Current ingredients: {current_ingredients}")

        logger.info("Extract ingredients from user prompt.")
        ingredients_from__user_prompt = extract_ingredients_from_prompt(
            logger, user_prompt, current_ingredients
        )

        if ingredients_from__user_prompt:
            ingredients = ingredients_from__user_prompt
        else:
            ingredients = generate_from_existing_ingredients(
                logger, current_ingredients
            )

        prompts = shuffle_ingredients(ingredients, num_of_recipes)
        recipes = []

        for prompt in prompts:
            input_prompt = prefix + prompt
            logger.info(
                f"Input prompt to the 'flax-community/t5-recipe-generation' model: '{input_prompt}'"
            )

            logger.info("Tokenizing input prompt...")
            encoded = tokenizer(
                input_prompt,
                max_length=512,
                padding="longest",
                truncation=True,
                return_tensors="jax",
            )

            logger.info(
                "Generaing the recipe output using the 'flax-community/t5-recipe-generation' model..."
            )
            outputs = model.generate(
                input_ids=encoded.input_ids,
                attention_mask=encoded.attention_mask,
                **generation_kwargs,
            )

            logger.info("Decoding the first generated sequence...")
            result = tokenizer.decode(outputs.sequences[0], skip_special_tokens=False)

            logger.info(
                "Parsing and converting sequence into recipe object and returning the result..."
            )

            draft_recipe = parse_recipe(result)
            refined_recipe = refine_recipe(
                logger, user_prompt, draft_recipe, current_ingredients
            )

            recipes.append(Recipe(**refined_recipe))

        return recipes

    except Exception as e:
        raise e
