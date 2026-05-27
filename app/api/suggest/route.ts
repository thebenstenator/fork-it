import { NextRequest, NextResponse } from 'next/server'
import { SuggestRequestSchema, SuggestResponseSchema, type Meal } from '@/lib/types'
import { normalizeIngredients, enrichRecipes, generateFallbackRecipes } from '@/lib/claude'
import { searchRecipes } from '@/lib/spoonacular'
import { buildCacheKey, getCachedResponse, setCachedResponse } from '@/lib/cache'
import { getToolAffiliateLink, getIngredientAffiliateLinks, getMealKitUrl } from '@/lib/affiliates'
import { ratelimit } from '@/lib/ratelimit'

// Spoonacular match quality threshold — below this we treat it as no match
const GOOD_MATCH_THRESHOLD = 3

export async function POST(req: NextRequest) {
  try {
    // ------------------------------------------------------------------
    // 1. Parse + validate input
    // ------------------------------------------------------------------
    const body = await req.json()
    const parsed = SuggestRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input. Please check your ingredients.', code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }
    const { ingredients: rawIngredients, filters } = parsed.data

    // ------------------------------------------------------------------
    // 2. Rate limit — 10 requests per IP per hour
    // ------------------------------------------------------------------
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: "You've been busy! Try again in an hour.", code: 'RATE_LIMITED' },
        { status: 429 }
      )
    }

    // ------------------------------------------------------------------
    // 3. Normalize ingredients (Claude — cheap fast call)
    // ------------------------------------------------------------------
    const normalizedIngredients = await normalizeIngredients(rawIngredients)

    // ------------------------------------------------------------------
    // 4. Check Redis cache (after normalization so key is stable)
    // ------------------------------------------------------------------
    const cacheKey = buildCacheKey(normalizedIngredients, filters)
    const cached = await getCachedResponse(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, source: 'cache' })
    }

    // ------------------------------------------------------------------
    // 5. Fetch from Spoonacular
    // ------------------------------------------------------------------
    const { recipes: spoonacularRecipes } = await searchRecipes(normalizedIngredients, filters)

    // ------------------------------------------------------------------
    // 6. Enrich or generate
    // ------------------------------------------------------------------
    let enrichedMeals: Meal[]
    let source: 'hybrid' | 'ai'

    if (spoonacularRecipes.length >= GOOD_MATCH_THRESHOLD) {
      // Happy path: enrich all 3 Spoonacular results with Claude
      const enrichment = await enrichRecipes(normalizedIngredients, spoonacularRecipes, filters)
      source = 'hybrid'

      enrichedMeals = enrichment.meals.map((meal, i) => {
        const spoon = spoonacularRecipes[i]
        return {
          ...meal,
          imageUrl: spoon?.image ?? null,
          matchScore: spoon
            ? { have: spoon.usedIngredientCount, total: spoon.usedIngredientCount + spoon.missedIngredientCount }
            : null,
          missingIngredients: spoon?.missedIngredients.map((m) => m.name) ?? [],
          showMealKitOffer: meal.missingCount >= 3,
        }
      })
    } else {
      // Fallback: some Spoonacular results + Claude generation for the rest
      const needed = 3 - spoonacularRecipes.length
      const [enrichedExisting, generated] = await Promise.all([
        spoonacularRecipes.length > 0
          ? enrichRecipes(normalizedIngredients, spoonacularRecipes, filters)
          : Promise.resolve({ meals: [] }),
        generateFallbackRecipes(normalizedIngredients, filters, needed),
      ])
      source = spoonacularRecipes.length > 0 ? 'hybrid' : 'ai'

      const existingMeals: Meal[] = enrichedExisting.meals.map((meal, i) => {
        const spoon = spoonacularRecipes[i]
        return {
          ...meal,
          imageUrl: spoon?.image ?? null,
          matchScore: spoon
            ? { have: spoon.usedIngredientCount, total: spoon.usedIngredientCount + spoon.missedIngredientCount }
            : null,
          missingIngredients: spoon?.missedIngredients.map((m) => m.name) ?? [],
          showMealKitOffer: meal.missingCount >= 3,
        }
      })

      const generatedMeals: Meal[] = generated.meals.map((meal) => ({
        ...meal,
        imageUrl: null,
        matchScore: null,
        missingIngredients: meal.missingIngredientNames ?? [],
        showMealKitOffer: meal.missingCount >= 3,
      }))

      enrichedMeals = [...existingMeals, ...generatedMeals].slice(0, 3)
    }

    // ------------------------------------------------------------------
    // 7. Apply affiliate signals (server-side only)
    // ------------------------------------------------------------------
    const mealsWithAffiliates: Meal[] = enrichedMeals.map((meal) => ({
      ...meal,
      mealKitUrl: meal.showMealKitOffer ? getMealKitUrl() : null,
      affiliateToolLink: meal.toolSuggestion
        ? getToolAffiliateLink(meal.toolSuggestion)?.url ?? null
        : null,
      affiliateIngredientLinks:
        meal.missingCount >= 1 && meal.missingCount < 3
          ? getIngredientAffiliateLinks(meal.missingIngredients)
          : [],
    }))

    // ------------------------------------------------------------------
    // 8. Validate final response shape
    // ------------------------------------------------------------------
    const response = SuggestResponseSchema.parse({
      meals: mealsWithAffiliates,
      source,
    })

    // ------------------------------------------------------------------
    // 9. Cache + return
    // ------------------------------------------------------------------
    await setCachedResponse(cacheKey, response)
    return NextResponse.json(response)
  } catch (err) {
    console.error('[/api/suggest] Error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
