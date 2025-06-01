"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import Link from "next/link";

type Recipe = {
  title: string;
  description: string;
  time: string;
  ingredients: string[];
  directions: string[];
  labels?: string[];
  warnings?: string[];
  notes?: string[];
  nutrition?: string[];
  creative_solution?: string;
};

export default function GenerateRecipePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptSuggestionGenerateError, setPromptSuggestionGenerateError] =
    useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecipes(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/recipe/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "An error occurred.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setRecipes(data.recipes);
    } catch (err) {
      setError("Could not connect to the recipe API.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAgain = () => {
    setPrompt("");
    setRecipes(null);
    setError(null);
    setLoading(false);
  };

  const handleGeneratePromptSuggestions = async () => {
    if (!showSuggestions && suggestions.length === 0) {
      setSuggestionsLoading(true);
      try {
        const res = await fetch("http://localhost:8000/prompt/suggestions");
        const data = await res.json();
        if (!data || data.length === 0) {
          setSuggestions([]);
          setPromptSuggestionGenerateError(
            "No prompt suggestions available at the moment."
          );
        } else {
          setSuggestions(data);
          setPromptSuggestionGenerateError(null);
        }
      } catch {
        setSuggestions([]);
        setPromptSuggestionGenerateError(
          "No prompt suggestions available at the moment."
        );
      } finally {
        setSuggestionsLoading(false);
      }
    }
    setShowSuggestions((prev) => !prev);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    setSuggestionsLoading(false);
  };

  const handleClearPromptSuggestions = () => {
    setSuggestions([]);
    setShowSuggestions(false);
    setSuggestionsLoading(false);
    setPromptSuggestionGenerateError(null);
  };

  return (
    <main className="p-4 max-w-3xl mx-auto">
      {!recipes || recipes.length === 0 ? (
        <div>
          {!loading ? (
            <>
              <div>
                <h2 className="text-center text-4xl font-semibold mb-6">
                  Discover Your Next Great Meal -{" "}
                  <div className="text-emerald-500">Powered by AI</div>
                </h2>
                <h4 className="text-center text-lg font-light mb-12 text-gray-600">
                  Start with a prompt. Leverage AI to turn leftovers, cravings,
                  or random ingredients into optimized, sustainable meals in
                  seconds.
                </h4>
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                <Textarea
                  placeholder="e.g. “I have chicken, rice, and broccoli. Make me a healthy stir-fry.”"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  className="h-48 bg-white border-0 rounded-2xl shadown-md"
                />
                <div className="text-center my-2">
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="my-2 pt-4 flex flex-wrap gap-2 justify-center">
                      {suggestionsLoading ? (
                        <span className="text-xs text-slate-600 text-center">
                          Loading suggestions...
                        </span>
                      ) : (
                        suggestions.map((suggestion, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-4 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-sm text-emerald-400 font-normal cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion.charAt(0).toUpperCase() +
                              suggestion.slice(1)}
                          </Badge>
                        ))
                      )}
                    </div>
                  )}
                  {!suggestionsLoading && suggestions.length === 0 && (
                    <Button
                      type="button"
                      variant="link"
                      className="font-normal my-2 text-sm cursor-pointer"
                      onClick={handleGeneratePromptSuggestions}
                    >
                      Not sure what to cook? Let our AI suggest a recipe!
                    </Button>
                  )}
                  {!suggestionsLoading && promptSuggestionGenerateError && (
                    <div className="mb-8 text-sm text-center text-red-500 bg-white rounded-full border-0 p-2 px-8">
                      {promptSuggestionGenerateError}
                    </div>
                  )}
                  {suggestionsLoading && suggestions.length === 0 && (
                    <Label className="text-center my-8 text-sm font-normal text-slate-600 flex justify-center items-center">
                      💡 AI generating smart prompt ideas... hang tight!
                    </Label>
                  )}
                  {suggestions.length > 0 && (
                    <Button
                      type="button"
                      variant="link"
                      className="font-normal text-sm cursor-pointer"
                      onClick={handleClearPromptSuggestions}
                    >
                      Clear Prompt Suggestions
                    </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!prompt.trim() || loading}
                  className="cursor-pointer w-full rounded-full py-6 mt-2 font-normal"
                >
                  Generate Recipe ✨
                </Button>
              </form>
              {error && (
                <div className="mt-4 text-sm text-center text-red-500 bg-white rounded-full border-0 p-2 px-8">
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center mt-8 justify-center h-[70vh] bg-white rounded-4xl">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <div className="text-slate-600 py-4 mt-4">
                🪄 Generating your personalized recipe ...
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-4xl mb-8">
          {recipes && (
            <div className="space-y-4">
              {recipes.map((recipe, idx) => (
                <div key={idx} className="">
                  <h2 className="text-4xl font-bold mb-4">{recipe.title}</h2>
                  <h4 className="text-lg text-slate-950 font-light mb-4">
                    {recipe.description}
                  </h4>
                  {recipe.labels && recipe.labels.length > 0 && (
                    <div className="my-4 flex flex-wrap gap-2">
                      {recipe.labels.map((label, i) => (
                        <Badge
                          key={i}
                          variant="default"
                          className="px-3 py-1 rounded-full border-0 text-xs"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="my-4 text-md text-slate-500">
                    Cooking Time:{" "}
                    <span className="text-slate-800 font-semibold">
                      {recipe.time}
                    </span>
                  </div>
                  <div className="mb-6 mt-4">
                    <h3 className="text-xl font-semibold">Ingredients 🥕</h3>
                    <div className="my-4">
                      {recipe.ingredients.map((ingredient, i) => (
                        <div key={i} className="mb-2">
                          <Badge
                            variant={"outline"}
                            className="rounded-full px-4 py-1 text-sm font-normal"
                          >
                            {ingredient.toLowerCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 border-gray-200 border-1 p-4 rounded-xl">
                      <span className="text-sm font-light">
                        Missing an ingredient? Grab it from your{" "}
                      </span>
                      <Link
                        href="/donate"
                        className="text-slate-950 text-sm mt-2 font-semibold cursor-pointer"
                      >
                        <span className="underline decoration-slate-900">
                          local food banks
                        </span>
                      </Link>
                      <span className="text-sm font-light">
                        {" "}
                        today and help reduce waste, and cook without worry.
                      </span>
                    </div>
                  </div>
                  <div className="mb-6 mt-4">
                    <h3 className="text-xl font-semibold">Directions 📋</h3>
                    <ol className="list-decimal ml-6 my-2">
                      {recipe.directions.map((step, i) => (
                        <li key={i} className="mb-1">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {recipe.warnings && recipe.warnings.length > 0 && (
                    <div className="mb-6 mt-4">
                      <h3 className="text-xl font-semibold">Warnings ⚠️</h3>
                      <ul className="list-disc ml-6 my-2">
                        {recipe.warnings.map((warning, i) => (
                          <li key={i} className="mb-1">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.notes && recipe.notes.length > 0 && (
                    <div className="mb-6 mt-4">
                      <h3 className="text-xl font-semibold">Notes ℹ️</h3>
                      <ul className="list-disc ml-6 my-2">
                        {recipe.notes.map((note, i) => (
                          <li key={i} className="mb-1">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.nutrition && recipe.nutrition.length > 0 && (
                    <div className="mb-6 mt-4">
                      <h3 className="text-xl font-semibold">Nutrition 🔋</h3>
                      <ul className="list-disc ml-6 my-2">
                        {recipe.nutrition.map((nutrition, i) => (
                          <li key={i} className="mb-1">
                            {nutrition.charAt(0).toUpperCase() +
                              nutrition.slice(1)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.creative_solution && (
                    <div className="mb-6 mt-4">
                      <h3 className="text-xl font-semibold">
                        Creative Idea 💡
                      </h3>
                      <p className="p-4 text-blue-500 bg-blue-50 mt-2 mb-8 rounded-xl">
                        {recipe.creative_solution}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-12 mb-4 flex flex-col items-center">
            <Label className="text-lg text-slate-500 text-center font-light">
              Not quite what you had in mind? Try a fresh recipe.
            </Label>
            <Button
              variant="outline"
              className="cursor-pointer px-8 py-4 mt-4"
              onClick={handleGenerateAgain}
            >
              Try Another Recipe
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
