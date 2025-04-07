import random

from datetime import datetime
from typing import List

from sqlmodel import Session, select
from sqlalchemy import asc

from .models import IngredientEntry
from .db import engine


def shuffle_ingredients(ingredients: list, n: int) -> List[str]:
    try:
        # ingredients = [i.strip() for i in ingredients.split(",") if i.strip()]
        ingredients_list = []

        for _ in range(n):
            random.shuffle(ingredients)
            ingredients_list.append(", ".join(ingredients))

        return ingredients_list

    except Exception as e:
        raise e


def get_ingredients_list() -> List[str]:
    try:
        try:
            with Session(engine) as session:
                # Sort by expiry date, nulls last (so items without expiry come last)
                ingredients = []
                expired_ingredients = []
                today = datetime.now().date()
                for row in session.exec(
                    select(IngredientEntry).order_by(
                        asc(IngredientEntry.expiry.is_(None)),  # False (not None) first, then True (None)
                        asc(IngredientEntry.expiry),
                    )
                ).all():
                    if row.expiry:
                        try:
                            expiry_date = (
                                row.expiry
                                if isinstance(row.expiry, datetime)
                                else datetime.strptime(str(row.expiry), "%Y-%m-%d")
                            ).date()
                            if expiry_date < today:
                                expired_ingredients.append(row.name)
                            else:
                                ingredients.append(row.name)
                        except Exception:
                            # If expiry can't be parsed, treat as not expired
                            ingredients.append(row.name)
                    else:
                        ingredients.append(row.name)
                print("Non-expired ingredients:", ingredients)
                print("Expired ingredients:", expired_ingredients)
        except Exception as db_error:
            print(
                f"Error fetching ingredients from the database: {db_error}. Using default ingredients."
            )
            ingredients = []
            expired_ingredients = []

        if not ingredients:
            ingredients = [
                "chicken",
                "lettuce",
                "steak",
                "spinach",
                "potato",
                "milk",
                "egg",
                "cheese",
                "rice",
                "orange",
                "apple",
                "aspargus",
            ]
        # Return both non-expired and expired ingredients
        return ingredients + expired_ingredients

    except Exception as e:
        raise e


def generate_from_existing_ingredients(
    logger: None, current_ingredients: List[str]
) -> List[str]:
    # Give 4 random ingredients a higher chance <= later on ingredients with most recent expiry date
    preferred_ingredients = random.sample(current_ingredients, 4)
    logger.info(f"preferred_ingredients: {preferred_ingredients}")
    less_common = list(set(current_ingredients) - set(preferred_ingredients))
    logger.info(f"less_common: {less_common}")

    # Ensure at least 1, and up to 4
    num_main_ingredients = random.randint(1, min(4, len(preferred_ingredients)))
    num_extra_ingredients = random.randint(0, min(2, len(less_common)))

    ingredients = random.sample(preferred_ingredients, num_main_ingredients)
    logger.info(f"main_ingredients: {ingredients}")
    ingredients += random.sample(less_common, num_extra_ingredients)
    logger.info(f"final_ingredients: {ingredients}")

    return ingredients
