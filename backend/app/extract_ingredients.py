import unicodedata
import re
import nltk

from typing import List, Set
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from rapidfuzz import process, fuzz


def get_stopwords():
    return set(stopwords.words("english"))


def get_lemmatizer():
    return WordNetLemmatizer()


def normalize_unicode(prompt: str) -> str:
    """
    Normalize accents and special unicode characters.
    """
    return (
        unicodedata.normalize("NFKD", prompt).encode("ASCII", "ignore").decode("utf-8")
    )


def clean_prompt(prompt: str) -> str:
    """
    Lowercase, remove special characters, normalize, and expand synonyms.
    """
    prompt = normalize_unicode(prompt.lower())
    prompt = re.sub(r"[^\w\s]", " ", prompt)  # remove punctuation
    prompt = re.sub(r"\s+", " ", prompt).strip()  # remove extra spaces

    return prompt


def lemmatize_and_filter(words: List[str]) -> List[str]:
    """
    Lemmatize and remove stopwords/adjectives.
    """
    lemmatizer = get_lemmatizer()
    stop_words = get_stopwords()
    return [
        lemmatizer.lemmatize(word)
        for word in words
        if word not in stop_words and word.isalpha()
    ]


def get_ngrams(words: List[str], max_n: int = 3) -> List[str]:
    """
    Generate all 1- to max_n-grams from list of words.
    """
    phrases = []
    for n in range(1, max_n + 1):
        phrases.extend(" ".join(words[i : i + n]) for i in range(len(words) - n + 1))
    return phrases


def extract_ingredients_from_prompt(
    logger: None, prompt: str, ingredients: list, threshold: int = 75
) -> list[str]:
    """
    Extract known ingredients from the input prompt using fuzzy matching.

    The function performs the following steps:
    - Tokenizes the input prompt into words.
    - Generates n-grams (1 to 3 words) to handle multi-word ingredients (e.g., "cottage cheese").
    - Normalizes text (e.g., lowercasing).
    - Uses fuzzy string matching (token_sort_ratio) to compare each n-gram against a list of known ingredients.
    - Matches with a similarity score above the given threshold (default 75) are considered hits.
    - Handles minor typos and word order variations through fuzzy matching.
    - Aggregates and returns a list of matched ingredients without duplicates.
    - Raises a ValueError if no ingredients are matched.

    Parameters:
    ----------
    logger : Optional[object]
        Logger instance for recording debug/info messages. Can be None.
    prompt : str
        Input text potentially containing ingredient names.
    ingredients : list
        List of known ingredient names to match against.
    threshold : int, optional
        Similarity score threshold (0-100) for fuzzy matching. Default is 75.

    Returns:
    -------
    List[str]
        List of matched ingredient names found in the prompt.

    Raises:
    ------
    ValueError
        If no known ingredients are found in the input prompt.
    """
    try:
        logger.info("Starting ingredient extraction...")

        # Clean and normalize input prompt
        cleaned_prompt = clean_prompt(prompt)
        # Split cleaned prompt into individual words and punctuation marks (tokens).
        tokens = nltk.word_tokenize(cleaned_prompt)
        filtered_tokens = lemmatize_and_filter(tokens)

        # Create search phrases (n-grams)
        phrases = get_ngrams(filtered_tokens, max_n=3)

        matched: Set[str] = set()

        for phrase in phrases:
            match = process.extractOne(
                phrase, ingredients, scorer=fuzz.token_sort_ratio
            )
            if match and match[1] >= threshold:
                matched.add(match[0])

        if not matched:
            logger.info(
                "No ingredients found in user prompt. Using all current ingredients to create recipe."
            )
            return None
        else:
            logger.info(f"Extracted ingredients from user prompt: {matched}")
            return list(matched)

    except Exception as e:
        logger.error("Ingredient extraction failed", exc_info=True)
        raise
