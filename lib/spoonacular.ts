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
// Returns enriched recipes filtered to those with a reasonable ingredient match.
// Falls back gracefully if some detail fetches fail.
// ---------------------------------------------------------------------------

export async function searchRecipes(
  ingredients: string[],
  limit = 3
): Promise<{ recipes: SpoonacularRecipe[]; goodMatchCount: number }> {
  // Fetch a few extras so we have options after filtering low-match results
  const candidates = await findRecipesByIngredients(ingredients, limit + 3)

  // Filter to recipes that match at least MIN_MATCH_RATIO of the search ingredients
  const goodMatches = candidates.filter((r) => {
    const total = r.usedIngredientCount + r.missedIngredientCount
    return total === 0 || r.usedIngredientCount / total >= MIN_MATCH_RATIO
  })

  // Fetch full details (steps + timing) for up to `limit` good matches
  const topMatches = goodMatches.slice(0, limit)
  const detailed = await Promise.allSettled(
    topMatches.map((r) => getRecipeInformation(r.id))
  )

  // Merge findByIngredients data (used/missed ingredients) with information data (steps)
  const recipes: SpoonacularRecipe[] = []
  for (let i = 0; i < detailed.length; i++) {
    const result = detailed[i]
    if (result.status === 'fulfilled') {
      recipes.push({
        ...result.value,
        usedIngredients: topMatches[i].usedIngredients,
        missedIngredients: topMatches[i].missedIngredients,
        usedIngredientCount: topMatches[i].usedIngredientCount,
        missedIngredientCount: topMatches[i].missedIngredientCount,
      })
    }
    // If a detail fetch fails, we just skip that recipe — Claude will fill the gap
  }

  return { recipes, goodMatchCount: goodMatches.length }
}
