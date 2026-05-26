import { z } from 'zod'

// ---------------------------------------------------------------------------
// Spoonacular raw types (what comes back from the API before enrichment)
// ---------------------------------------------------------------------------

export interface SpoonacularIngredient {
  id: number
  name: string
  image: string
  amount: number
  unit: string
}

export interface SpoonacularRecipe {
  id: number
  title: string
  image: string
  usedIngredientCount: number
  missedIngredientCount: number
  usedIngredients: SpoonacularIngredient[]
  missedIngredients: SpoonacularIngredient[]
  likes: number
  // From the /recipes/{id}/information endpoint
  readyInMinutes?: number
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  dairyFree?: boolean
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number
      step: string
    }>
  }>
}

// ---------------------------------------------------------------------------
// Enriched meal (what Claude produces + what the client receives)
// ---------------------------------------------------------------------------

export const MealSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  pitch: z.string().min(1).max(300),
  timeEstimate: z.string(),
  imageUrl: z.string().url().nullable(),
  matchScore: z
    .object({
      have: z.number().int().min(0),
      total: z.number().int().min(1),
    })
    .nullable(), // null for Claude-generated fallback cards
  missingIngredients: z.array(z.string()),
  steps: z.array(z.string()).min(2).max(12),
  toolSuggestion: z.string().nullable(),
  missingCount: z.number().int().min(0),
  showMealKitOffer: z.boolean().default(false),
  mealKitUrl: z.string().url().nullable().optional(),
  affiliateToolLink: z.string().url().nullable().optional(),
  affiliateIngredientLinks: z
    .array(
      z.object({
        ingredient: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
})

export const SuggestResponseSchema = z.object({
  meals: z.array(MealSchema).min(1).max(3),
  source: z.enum(['hybrid', 'ai', 'cache']),
})

export type Meal = z.infer<typeof MealSchema>
export type SuggestResponse = z.infer<typeof SuggestResponseSchema>

// ---------------------------------------------------------------------------
// API request
// ---------------------------------------------------------------------------

export const SuggestRequestSchema = z.object({
  ingredients: z.string().min(2).max(500),
  filters: z.array(z.string()).default([]),
})

export type SuggestRequest = z.infer<typeof SuggestRequestSchema>

// ---------------------------------------------------------------------------
// Claude enrichment output schema (what we parse from Claude's JSON response)
// ---------------------------------------------------------------------------

export const ClaudeEnrichmentSchema = z.object({
  meals: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(100),
      pitch: z.string().min(1).max(300),
      timeEstimate: z.string(),
      steps: z.array(z.string()).min(2).max(12),
      toolSuggestion: z.string().nullable(),
      missingCount: z.number().int().min(0),
    })
  ),
})

export type ClaudeEnrichment = z.infer<typeof ClaudeEnrichmentSchema>
