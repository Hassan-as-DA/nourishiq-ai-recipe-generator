"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default function RecipePage({ params }: Props) {
  const { id } = React.use(params);

  // Extract recipe data from the query
  const searchParams = useSearchParams();
  const recipeParam = searchParams.get("recipe");
  const recipe = recipeParam
    ? {
        ...JSON.parse(recipeParam),
        ingredients: JSON.parse(recipeParam).ingredients || [],
        steps: JSON.parse(recipeParam).steps || [],
      }
    : {
        title: `Demo Recipe #${id}`,
        ingredients: ["Chicken", "Rice", "Soy Sauce"] as string[],
        steps: [
          "Slice the chicken.",
          "Stir-fry with rice and sauce.",
          "Serve hot.",
        ],
      };

  return (
    <main className="p-12 bg-white rounded-4xl mb-12 max-w-2xl mx-auto space-y-6">
      <h2 className="text-4xl font-bold mb-4">{recipe.title}</h2>
      <h4 className="text-xl text-slate-900 font-light mb-4">
        {recipe.description}
      </h4>
      {recipe.labels && recipe.labels.length > 0 && (
        <div className="my-4 flex flex-wrap gap-2">
          {recipe.labels.map((label: string, i: number) => (
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
        <span className="text-slate-800 font-semibold">{recipe.time}</span>
      </div>
      <div className="mb-6 mt-4">
        <h3 className="text-xl font-semibold">Ingredients 🥕</h3>
        <div className="my-4">
          {recipe.ingredients.map((ingredient: string, i: number) => (
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
          <span className="text-sm font-light"> today and help reduce waste, and cook without worry.</span>
        </div>
      </div>
      <div className="mb-6 mt-4">
        <h3 className="text-xl font-semibold">Directions 📋</h3>
        <ol className="list-decimal ml-6 my-2">
          {recipe.directions.map((step: string, i: number) => (
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
            {recipe.warnings.map((warning: string, i: number) => (
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
            {recipe.notes.map((note: string, i: number) => (
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
            {recipe.nutrition.map((nutrition: string, i: number) => (
              <li key={i} className="mb-1">
                {nutrition.charAt(0).toUpperCase() + nutrition.slice(1)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {recipe.creative_solution && (
        <div className="mb-6 mt-4">
          <h3 className="text-xl font-semibold">Creative Idea 💡</h3>
          <p className="p-4 text-blue-500 bg-blue-50 mt-2 mb-8 rounded-xl">
            {recipe.creative_solution}
          </p>
        </div>
      )}
    </main>
  );
}
