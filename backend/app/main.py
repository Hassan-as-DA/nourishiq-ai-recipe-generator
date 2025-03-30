from typing import List
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Path, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, select

from .db import engine, get_session
from .models import RecipeEntry, IngredientEntry
from .schemas import RecipeRequest, RecipeResponse, IngredientAddRequest, IngredientIn
from .generate_recipes import generate_recipes
from .validate_user_prompt import is_valid_user_prompt
from .mistral_7b_model import validate_user_prompt, generate_prompt_suggestions


@asynccontextmanager
async def lifespan(app: FastAPI):
    import nltk
    import os
    import ssl
    import certifi

    # Force Python to use certifi's CA bundle for secure downloads
    def create_certifi_context():
        return ssl.create_default_context(cafile=certifi.where())

    ssl._create_default_https_context = create_certifi_context

    nltk_path = os.path.join(os.path.dirname(__file__), "nltk_data")
    if nltk_path not in nltk.data.path:
        nltk.data.path.append(nltk_path)

    # Helper to check if resource exists
    def is_nltk_resource_available(resource_name: str) -> bool:
        try:
            nltk.data.find(resource_name)
            return True
        except LookupError:
            return False

    # Download only if missing
    if not is_nltk_resource_available("corpora/stopwords"):
        nltk.download("stopwords", download_dir=nltk_path)
    if not is_nltk_resource_available("corpora"):
        nltk.download("wordnet", download_dir=nltk_path)
    if not is_nltk_resource_available("corpora/words"):
        nltk.download("words", download_dir=nltk_path)
    if not is_nltk_resource_available("tokenizers/punkt_tab/english"):
        nltk.download("punkt_tab", download_dir=nltk_path)

    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(title="Recipe Generator API", lifespan=lifespan)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post(
    "/recipe/generate",
    response_model=RecipeResponse,
    summary="Generate healthy recipes for a given prompt",
)
def generate(request: RecipeRequest, session=Depends(get_session)):
    prompt = request.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=422, detail="Prompt cannot be empty")

    user_prompt_validation_result = validate_user_prompt(prompt)
    if user_prompt_validation_result.get("result") == "invalid":
        raise HTTPException(
            status_code=400,
            detail="Your prompt does not appear to be valid for recipe generation. Please ask something like 'Suggest a meal with chicken' or 'Give me a dinner recipe'.",
        )

    if not is_valid_user_prompt(prompt):
        raise HTTPException(
            status_code=400,
            detail="Your input does not appear to be valid for recipe generation. Please ask something like 'Suggest a meal with chicken' or 'Give me a dinner recipe'.",
        )

    try:
        recipes = generate_recipes(user_prompt=prompt, num_of_recipes=1)
        if not recipes:
            raise ValueError("Empty response from model")

        entry = RecipeEntry(prompt=request.prompt)
        entry.recipes = [r.model_dump() for r in recipes]

        session.add(entry)
        session.commit()
        session.refresh(entry)

        return {
            "status_code": 200,
            "success": True,
            "message": "Recipes generated successfully",
            "recipes": recipes,
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate recipe. Please try again.",
        )

@app.get(
    "/prompt/suggestions",
    summary="Get 3 prompt suggestions for recipe generation",
    response_model=List[str],
)
def get_prompt_suggestions(session=Depends(get_session)):
    try:
        prompt_suggestions = generate_prompt_suggestions()
        return prompt_suggestions

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate prompt suggestions.",
        )

@app.get(
    "/history",
    response_model=List[RecipeResponse],
    summary="Get all previous generated recipes (prompts + outputs)",
)
def history(session=Depends(get_session)):
    rows = session.exec(select(RecipeEntry)).all()
    return [
        RecipeResponse(id=row.id, prompt=row.prompt, recipes=row.recipes) 
        for row in rows
    ]


@app.post(
    "/ingredients/add",
    summary="Add a new ingredient",
)
def add_ingredient(request: IngredientAddRequest, session=Depends(get_session)):
    try:
        ingredient_data = request.ingredient

        if (
            not ingredient_data.name
            or not ingredient_data.quantity
            or not ingredient_data.unit
        ):
            raise HTTPException(
                status_code=422,
                detail="Ingredient name, quantity, and unit are required fields",
            )

        if ingredient_data.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Ingredient quantity must be greater than zero",
            )

        entry = IngredientEntry(
            name=ingredient_data.name.strip(),
            quantity=ingredient_data.quantity,
            unit=ingredient_data.unit.strip(),
            expiry=ingredient_data.expiry,
        )

        session.add(entry)
        session.commit()
        session.refresh(entry)

        return {
            "status_code": 200,
            "success": True,
            "message": "Ingredient added successfully",
        }

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}",
        )


@app.get(
    "/ingredients",
    summary="Get all ingredients",
)
def get_ingredients(session=Depends(get_session)):
    ingredients = session.exec(select(IngredientEntry)).all()
    return [ingredient.dict() for ingredient in ingredients]


@app.put(
    "/ingredients/edit/{ingredient_id}",
    summary="Edit an existing ingredient by ID",
)
def edit_ingredient(
    ingredient_id: str = Path(..., description="The ID of the ingredient to edit"),
    ingredient: IngredientIn = ...,
    session=Depends(get_session),
):
    db_ingredient = session.get(IngredientEntry, ingredient_id)
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    # Update fields
    db_ingredient.name = ingredient.name.strip()
    db_ingredient.quantity = ingredient.quantity
    db_ingredient.unit = ingredient.unit.strip()
    db_ingredient.expiry = ingredient.expiry

    session.add(db_ingredient)
    session.commit()
    session.refresh(db_ingredient)

    return {
        "status_code": 200,
        "success": True,
        "message": "Ingredient updated successfully",
        "ingredient": db_ingredient.dict(),
    }


@app.delete(
    "/ingredients/delete/{ingredient_id}",
    summary="Delete an ingredient by ID",
    status_code=status.HTTP_200_OK,
)
def delete_ingredient(
    ingredient_id: str = Path(..., description="The ID of the ingredient to delete"),
    session=Depends(get_session),
):
    db_ingredient = session.get(IngredientEntry, ingredient_id)
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    session.delete(db_ingredient)
    session.commit()

    return {
        "status_code": 200,
        "success": True,
        "message": "Ingredient deleted successfully",
        "ingredient_id": ingredient_id,
    }
