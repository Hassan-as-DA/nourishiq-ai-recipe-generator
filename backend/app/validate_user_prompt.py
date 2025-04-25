import re

from nltk.corpus import words, wordnet
from nltk.tokenize import word_tokenize
from rapidfuzz.fuzz import partial_ratio

# Recipe-related keywords
RECIPE_KEYWORDS = {
    "recipe",
    "easy meal",
    "quick",
    "healthy",
    "dish",
    "meal",
    "cook",
    "prepare",
    "dinner",
    "lunch",
    "breakfast",
    "snack",
    "make",
    "suggest",
    "something to eat",
    "food",
    "tasty",
    "creative",
    "vegan",
    "non-vegan",
    "non vegan",
    "vegetarian",
    "lactose-free",
    "lactosefree",
    "non-vegetarian",
    "gluten",
    "gluten-free",
    "low-card",
    "main course",
    "grill",
    "side dish",
    "appetizer",
    "high-protein",
}

# Non-recipe triggers (to be rejected)
NON_RECIPE_TRIGGERS = {
    "capital",
    "president",
    "weather",
    "news",
    "stock",
    "who is",
    "what is",
    "when is",
    "where is",
    "history",
    "math",
    "science",
    "age of",
    "sports",
    "football",
    "spurs",
    "movie",
    "actor",
}


def get_words():
    return set(words.words())


def is_food_related_word(word: str) -> bool:
    """Check if a word is semantically related to food using WordNet."""
    for syn in wordnet.synsets(word, pos=wordnet.NOUN):
        for hypernym in syn.closure(lambda s: s.hypernyms()):
            if any(
                food_cat in hypernym.name()
                for food_cat in ("food", "meal", "dish", "nutrient", "ingredient")
            ):
                return True
    return False


def is_valid_user_prompt(prompt: str, debug: bool = False) -> bool:
    prompt_lower = prompt.lower()

    # 1. Reject prompt if it contains known non-recipe triggers
    for phrase in NON_RECIPE_TRIGGERS:
        if phrase in prompt_lower:
            if debug:
                print(f"❌ Rejected: matched non-recipe trigger '{phrase}'")
            return False

    # 2. Tokenize input using nltk
    try:
        tokens = word_tokenize(prompt_lower)
    except Exception:
        tokens = re.findall(r"\b[a-zA-Z]{3,}\b", prompt_lower)

    # 3. Filter meaningful words based on English vocabulary
    english_words = get_words()
    meaningful_words = [word for word in tokens if word in english_words]
    if len(meaningful_words) < 2:
        if debug:
            print("❌ Rejected: too few real English words.")
        return False

    # 4. Fuzzy match with recipe keywords using rapidfuzz
    fuzzy_scores = [partial_ratio(prompt_lower, keyword) for keyword in RECIPE_KEYWORDS]
    if max(fuzzy_scores) >= 80:
        if debug:
            print("✅ Accepted: fuzzy match with recipe keywords.")
        return True

    # 5. Direct keyword presence
    if any(kw in prompt_lower for kw in RECIPE_KEYWORDS):
        if debug:
            print("✅ Accepted: direct keyword match.")
        return True

    # 6. Fallback: some real words + soft keyword match
    if meaningful_words and any(kw in tokens for kw in RECIPE_KEYWORDS):
        if debug:
            print("✅ Accepted: fallback heuristic.")
        return True

    # 7. WordNet-based semantic check
    if any(is_food_related_word(word) for word in meaningful_words):
        if debug:
            print("✅ Accepted: wordnet match for food-related concept.")
        return True

    if debug:
        print("❌ Rejected: no rules matched.")
    return False
