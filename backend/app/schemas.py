from pydantic import BaseModel
from typing import List, Optional


class Recipe(BaseModel):
    title: str
    description: str
    time: str
    ingredients: List[str]
    directions: List[str]
    labels: List[str]
    warnings: List[str]
    notes: List[str]
    nutrition: List[str]
    creative_solution: str

class RecipeRequest(BaseModel):
    prompt: str


class RecipeResponse(BaseModel):
    recipes: List[Recipe]


class IngredientIn(BaseModel):
    name: str
    quantity: float
    unit: str
    expiry: Optional[str] = None


class IngredientAddRequest(BaseModel):
    ingredient: IngredientIn
