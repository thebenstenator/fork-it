"use client";

import { useState } from "react";
import { IngredientInput } from "@/components/IngredientInput";
import { FilterChips } from "@/components/FilterChips";
import { MealSuggestions } from "@/components/MealSuggestions";
import { KofiPrompt } from "@/components/KofiPrompt";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useMealSuggestions } from "@/hooks/useMealSuggestions";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";

export default function Home() {
  const { data, isLoading, error, fetchSuggestions } = useMealSuggestions();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { user } = useAuth();
  const { toggleFavorite, isFavorited } = useFavorites(user);

  function handleSubmit(ingredients: string) {
    fetchSuggestions(ingredients, activeFilters);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-[680px] px-4 py-10 space-y-8">
        {/* Header */}
        <header className="space-y-1">
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              fork it.
            </h1>
            <nav className="flex items-center gap-4 shrink-0 text-xs text-stone-400">
              <Link href="/history" className="hover:text-stone-600 transition-colors">
                Recent
              </Link>
              <Link href="/favorites" className="hover:text-stone-600 transition-colors flex items-center gap-1">
                Saved <Heart size={11} className="text-red-700 fill-red-700" />
              </Link>
            </nav>
          </div>
          <p className="text-stone-500">
            Real dinner ideas from whatever you&apos;ve got.
          </p>
        </header>

        {/* Input */}
        <IngredientInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Dietary filters */}
        <FilterChips onChange={setActiveFilters} />

        {/* Results */}
        <MealSuggestions
          data={data}
          isLoading={isLoading}
          error={error}
          user={user}
          isFavorited={isFavorited}
          onToggleFavorite={toggleFavorite}
        />

        {/* Ko-fi prompt — appears once after first successful result */}
        <KofiPrompt show={!!data && !isLoading} />

        {/* Footer */}
        <footer className="pt-8 border-t border-stone-200 space-y-1 text-xs text-stone-400 text-center">
          <p>
            <Link href="/ideas" className="hover:text-stone-600 transition-colors">
              Browse ingredient ideas
            </Link>
          </p>
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
              Buy me a coffee
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
