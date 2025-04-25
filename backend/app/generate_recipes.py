import logging

from typing import List

from .schemas import Recipe
from .t5_recipe_generation_model import t5_recipe_generation_model

logging.getLogger("jax._src.xla_bridge").setLevel(logging.ERROR)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[logging.StreamHandler()],
)

logger = logging.getLogger(__name__)


def generate_recipes(user_prompt: str, num_of_recipes: int = 1) -> List[Recipe]:
    logger.info(
        f"Generating {num_of_recipes} recipes from user prompt: '{user_prompt}'."
    )
    recipes = t5_recipe_generation_model(logger, user_prompt, num_of_recipes)
    logger.info(
        f"Successfully generated {num_of_recipes} recipe from user prompt: '{user_prompt}'"
    )

    return recipes
