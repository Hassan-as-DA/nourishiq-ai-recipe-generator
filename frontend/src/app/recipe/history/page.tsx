"use client";

import { useEffect, useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

type Recipe = {
  prompt?: string;
  title: string;
  description: string;
  time: string;
  ingredients: string[];
  directions: string[];
  labels?: string[];
  warnings?: string[];
  notes?: string[];
  nutrition?: string[];
  id?: string;
};

type RecipeHistoryItem = {
  recipes: Recipe[];
};

export default function RecipeHistoryPage() {
  const [history, setHistory] = useState<RecipeHistoryItem[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/history")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="px-12 w-full mx-auto">
      <h2 className="text-4xl font-semibold mb-2 text-center">
        Your Recipes, <span className="text-emerald-500">All in One Place</span>
      </h2>
      <h4 className="text-lg font-light text-slate-600 mb-8 text-center">
        Every smart recipe you've generated, saved here for inspiration, reuse,
        or sharing.
      </h4>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-600 mt-8">
          No recipe history found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {history
            .slice()
            .reverse()
            .map((item, idx) =>
              item.recipes.map((recipe, ridx) => (
                <Card key={idx + "-" + ridx} className="flex flex-col h-full border-0 shadow-xs rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{recipe.title} {recipe.id}</CardTitle>
                    <div className="text-xs text-gray-400">
                      {recipe.time && <>Cooking Time: {recipe.time}</>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {recipe.labels && recipe.labels.length > 0 && (
                      <div className="my-4 flex flex-wrap gap-2">
                        {recipe.labels.map((label, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="px-3 py-1 rounded-full border border-gray-300 text-xs"
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                        <Button
                          className="w-full cursor-pointer"
                          onClick={() => {
                          const recipeSlug = recipe.title.toLowerCase().replace(/\s+/g, "-");
                          router.push(
                            `/recipe/${recipeSlug}?recipe=${encodeURIComponent(JSON.stringify(recipe))}`
                          );
                          }}
                        >
                          View Recipe
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
        </div>
      )}
    </main>
  );
}
