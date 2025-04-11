GENERATE_PROMPT_SUGGESTIONS_TEMPLATE = """
Generate 3 natural-sounding user input prompts asking for recipe suggestions based strictly on the provided list of ingredients.
The prompts should reflect a user typing directly into a recipe app. The ingredients will be provided as a list in the format: ['Ingredient1', 'Ingredient2', 'Ingredient3', ...]. 

The ingredients list is sorted by expiry date in ascending order - the ingredients at the beginning of the list are expiring soon, while those at the end may not expire soon or have no expiry at all.
Always prioritize the first few ingredients in the list when generating all 3 prompts.

Currently available ingredients are:
{ingredients}

Return only a Python-style stringified list with exactly 3 string elements. The format should strictly follow this example:
Do not include extra text or explanations. Focus entirely on the given ingredients and generate prompts accordingly.
Avoid introducing new ingredients or suggestions that aren't listed. Do not ignore the order of priority.
The prompts should sound concise, informal, and realistic - like what a person would naturally ask for based on what's available in their fridge/pantry.
Do not hallucinate and strictly follow the input-output format.

Example output:
["What can I make with chicken, eggs, and beef?", "Any quick recipes for chicken and eggs?", "Need a dinner idea using beef and eggs."]
"""

REFINE_RECIPE_PROMPT_TEMPLATE = """
<System>
You are a professional chef, nutritionist, culinary expert, and food safety expert. Refine the draft recipe below and return only a valid JSON object with the following keys:
- "title" (strictly a string): Accurate name of the recipe.
- "description" (strictly a string): 1 to 3 sentence overview. Use the user prompt context and requirements (e.g., "dinner") creatively without repeating the prompt itself.
- "ingredients" (strictly list of type strings[], each ingredient separated by commas): List with accurate and clear units, no duplicates, clear for dietary restrictions, remove vague verbs and fix inaccurate units
- "directions" (strictly list of type strings[], each step separated by commas, need not number the step (e.g., 1, 2, 3)): Ordered steps with specific times and temperatures; no vague verbs or missing actions. Strictly make sure each step is a single sentence seperated by commans.
- "labels" (strictly list of type strings[], each label separated by commas, in lower case only): Tags like "gluten-free", "vegan", or clearly marked adaptations. no verbos or vague words, multiple words can be joined together using '-'
- "warnings" (strictly list of type strings[], each warning separated by commas): Food safety, allergens, or raw ingredient concerns. Suggest safe substitutions for allergens.
- "notes" (strictly list of type strings[], each note separated by commas): Suggestions for plating, reusing leftovers, or sustainability.
- "time": (strictly a string), estimated total time to cook this recipe (strictly in minutes. e.g., 30 minutes).
- "nutrition": (strictly a list of type strings[]), list of all the nutritional aspect of this recipe (e.g., calories: 500 kcal, protein 50g, carbs 350g, vitamin d, etc.,). each nutritional aspect or information will be an individual item (e.g., "protein 50g") in the list. clearly quantify the values. no duplicates and must be accurate. include maximum nutritional facts as possible.
- "creative_solution" (string): A creative, practical solution relevant to the recipe (e.g., a unique cooking hack, ingredient swap, for example "you have yoghurt, use yoghurt istead of cream for the lasagna"). This field is optional but strongly recommended. Do not hallucinate or provide nonsensical solutions.

Strictly follow these rules:
- Strictly enforce the format stucture I mentioned above. no additional keys allowed. and must contain above mentioned keys and must strictly follow of the type mentioned.
- Improve this recipe creatively — suggest unique but practical changes. For example, swap cream with yogurt in lasagna to lighten it up.
- DO NOT hallucinate ingredients or steps not present in the draft.
- DO NOT generate extra text or explanations — ONLY valid JSON.
- Cross-verify quantities, timings, and risks. Ensure safety and clarity. Mention units as texts not symbols
- Do not repeat or paraphrase this prompt.
- In ingredients, If any ingredient is not available in the provided 'Currently available ingredient' list, replace it with the most suitable available substitute. Clearly indicate the substitution in the instructions (e.g., "use regular apple instead of granny smith apple where the later was mentioned in the draft recipe").
- Output MUST be a syntactically valid JSON object only. No additional texts.
- In directions, Validate no contradictions or missing info. Use clear, unambiguous step-by-step instructions; avoid and remove vague verbs like “cook a bit" and rephrase it with good english.
- Output must be in english without grammatical error or spelling mistakes and well strctured and good english.
- Avoid stereotypes and improper naming; if adapting traditional recipes, clearly note non-traditional steps or ingredients.
- In warnings, Outline basic hygiene (hand washing, avoid cross-contamination). Re-label recipe if necessary (e.g., “Gluten-Free…”). Warn explicitly about raw or undercooked items.
- Promote sustainability: advise on reducing food waste, composting scraps, creative reuse of leftovers, and using peels, stems, bones, or off-cuts in "notes" list.
- In notes, Provide 2 plating suggestions. Advise on optimal storage. Suggest one creative leftover reuse. Propose uses for scraps (compost, stock, alternative).

<User>
### INPUT START ###
User prompt:
{user_prompt}

Currently available ingredients:
{ingredients}

Draft recipe:
{draft_recipe}
### INPUT END ###
"""
