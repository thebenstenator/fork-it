import { type SpoonacularRecipe } from './types'

const BASE_URL = 'https://api.spoonacular.com'
const API_KEY = process.env.SPOONACULAR_API_KEY!

// Minimum match ratio to consider a Spoonacular result "good enough" to use.
// Below this threshold the recipe requires too many missing ingredients.
const MIN_MATCH_RATIO = 0.3

if (!API_KEY) {
  throw new Error('SPOONACULAR_API_KEY is not set in environment variables')
}

// ---------------------------------------------------------------------------
// Step 1: Find recipes by ingredients
// See: https://spoonacular.com/food-api/docs#Search-Recipes-by-Ingredients
// Cost: 1 point per result returned
// ---------------------------------------------------------------------------

export async function findRecipesByIngredients(
  ingredients: string[],
  count = 5 // fetch a few extra so we have fallback options after filtering
): Promise<SpoonacularRecipe[]> {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    ingredients: ingredients.join(','),
    number: String(count),
    ranking: '1', // 1 = maximize used ingredients
    ignorePantry: 'true',
  })

  const res = await fetch(`${BASE_URL}/recipes/findByIngredients?${params}`, {
    next: { revalidate: 0 }, // always fresh — caching is handled by Redis
  })

  if (!res.ok) {
    throw new Error(`Spoonacular findByIngredients failed: ${res.status}`)
  }

  return res.json() as Promise<SpoonacularRecipe[]>
}

// ---------------------------------------------------------------------------
// Step 2: Get full recipe details (steps, timing, image) for each match
// See: https://spoonacular.com/food-api/docs#Get-Recipe-Information
// Cost: 1 point per call
// ---------------------------------------------------------------------------

export async function getRecipeInformation(id: number): Promise<SpoonacularRecipe> {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    includeNutrition: 'false',
  })

  const res = await fetch(`${BASE_URL}/recipes/${id}/information?${params}`, {
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Spoonacular getRecipeInformation failed for id ${id}: ${res.status}`)
  }

  return res.json() as Promise<SpoonacularRecipe>
}

// ---------------------------------------------------------------------------
// Combined: search + fetch details for the top matches
// Returns enriched recipes filtered to those with a reasonable ingredient match
// and matching any dietary filters.
// ---------------------------------------------------------------------------

function matchesDietaryFilters(
  recipe: SpoonacularRecipe,
  filters: string[]
): boolean {
  for (const filter of filters) {
    switch (filter) {
      case 'vegetarian':
        if (!recipe.vegetarian) return false
        break
      case 'dairy-free':
        if (!recipe.dairyFree) return false
        break
      case 'gluten-free':
        if (!recipe.glutenFree) return false
        break
      case 'quick':
        if (!recipe.readyInMinutes || recipe.readyInMinutes > 20) return false
        break
      // 'kid-friendly' has no Spoonacular signal — handled by Claude prompt only
    }
  }
  return true
}

export async function searchRecipes(
  ingredients: string[],
  filters: string[] = [],
  limit = 3
): Promise<{ recipes: SpoonacularRecipe[]; goodMatchCount: number }> {
  // Fetch extra candidates when filters are active — some will be excluded
  const fetchCount = filters.length > 0 ? limit + 6 : limit + 3
  const candidates = await findRecipesByIngredients(ingredients, fetchCount)

  // Filter to recipes with a reasonable ingredient match ratio
  const goodMatches = candidates.filter((r) => {
    const total = r.usedIngredientCount + r.missedIngredientCount
    return total === 0 || r.usedIngredientCount / total >= MIN_MATCH_RATIO
  })

  // Fetch full details for more candidates than needed so we have room to filter
  const toFetch = goodMatches.slice(0, filters.length > 0 ? limit + 4 : limit)
  const detailed = await Promise.allSettled(
    toFetch.map((r) => getRecipeInformation(r.id))
  )

  // Merge findByIngredients data with information data
  const merged: SpoonacularRecipe[] = []
  for (let i = 0; i < detailed.length; i++) {
    const result = detailed[i]
    if (result.status === 'fulfilled') {
      merged.push({
        ...result.value,
        usedIngredients: toFetch[i].usedIngredients,
        missedIngredients: toFetch[i].missedIngredients,
        usedIngredientCount: toFetch[i].usedIngredientCount,
        missedIngredientCount: toFetch[i].missedIngredientCount,
      })
    }
  }

  // Apply dietary filters post-fetch using Spoonacular's recipe flags
  const filtered = filters.length > 0
    ? merged.filter((r) => matchesDietaryFilters(r, filters))
    : merged

  return {
    recipes: filtered.slice(0, limit),
    goodMatchCount: goodMatches.length,
  }
}
