import json
import uuid

from typing import Optional, List
from sqlmodel import SQLModel, Field


class RecipeEntry(SQLModel, table=True):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True
    )
    prompt: str
    recipes_json: str

    @property
    def recipes(self) -> List[str]:
        return json.loads(self.recipes_json)

    @recipes.setter
    def recipes(self, value: List[str]):
        self.recipes_json = json.dumps(value)


class IngredientEntry(SQLModel, table=True):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True
    )
    name: str
    quantity: float
    unit: str
    expiry: Optional[str] = None
