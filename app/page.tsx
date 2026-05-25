"use client";

import { IngredientInput } from "@/components/IngredientInput";
import { MealSuggestions } from "@/components/MealSuggestions";
import { useMealSuggestions } from "@/hooks/useMealSuggestions";

export default function Home() {
  const { data, isLoading, error, fetchSuggestions } = useMealSuggestions();

  function handleSubmit(ingredients: string) {
    // No filters in Slice 1 — added in Slice 3
    fetchSuggestions(ingredients, []);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-[680px] px-4 py-10 space-y-8">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            fork it.
          </h1>
          <p className="text-stone-500">
            Fork what&apos;s in your fridge. Dinner sorted.
          </p>
        </header>

        {/* Input */}
        <IngredientInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Results */}
        <MealSuggestions data={data} isLoading={isLoading} error={error} />

        {/* Footer */}
        <footer className="pt-8 border-t border-stone-200 space-y-1 text-xs text-stone-400">
          <p>
            Built by{" "}
            <a
              href="https://github.com/thebenstenator"
              className="hover:text-stone-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ben
            </a>
            {" · "}
            <a
              href="https://ko-fi.com/benanderson5809"
              className="hover:text-stone-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              ☕ Buy me a coffee
            </a>
          </p>
          <p>
            Recipes via{" "}
            <a
              href="https://spoonacular.com"
              className="hover:text-stone-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Spoonacular
            </a>
            {" · "}
            This page may contain affiliate links.
          </p>
        </footer>
      </div>
    </div>
  );
}
