import Anthropic from '@anthropic-ai/sdk'
import { ClaudeEnrichmentSchema, type ClaudeEnrichment, type SpoonacularRecipe } from './types'

const client = new Anthropic() // reads ANTHROPIC_API_KEY from env automatically

// ---------------------------------------------------------------------------
// Prompts — see specs/PROMPT_ENGINEERING.md for full rationale
// ---------------------------------------------------------------------------

const NORMALIZATION_SYSTEM_PROMPT = `You are an ingredient parser. Convert the user's messy, colloquial ingredient list into a clean, comma-separated list of specific ingredient names.

RULES:
1. Return ONLY a JSON array of strings — no explanation, no preamble.
2. Standardize quantities and descriptors: "some leftover rotisserie chicken" → "cooked chicken"
3. Resolve vague references: "that can of beans I've had forever" → "black beans"
4. Preserve specificity where it matters: "ground beef" stays "ground beef", not just "beef"
5. Remove non-ingredient text: "I think I have...", "there's some...", "maybe..."
6. If an item is clearly not a food ingredient, omit it.
7. Maximum 12 ingredients in the output — use the most significant ones if the user lists more.`

const ENRICHMENT_SYSTEM_PROMPT = `You are a warm, practical cooking assistant helping busy parents figure out dinner with whatever they have on hand.

You will receive a list of recipes from a recipe database, matched to the user's ingredients. Your job is to enrich each recipe — write a warm pitch, adapt the steps to the user's specific ingredients, and flag any useful signals for contextual suggestions.

RULES:
1. Write the pitch in a warm, encouraging tone — like a friend who cooks, not a recipe bot.
2. Adapt the steps to acknowledge what the user ACTUALLY HAS. If they have cooked chicken instead of raw, adjust the steps. If they're missing an ingredient, mention a simple substitute inline.
3. Keep steps practical and non-chef. Assume a tired weeknight parent, not a culinary student.
4. The toolSuggestion should be one common kitchen tool that would genuinely make this recipe easier — or null if nothing specific applies. Do not invent a need for a tool.
5. Set missingCount to the number of non-pantry-staple ingredients the user is missing. Pantry staples (salt, pepper, oil, butter, garlic, basic dried spices, soy sauce, vinegar) do not count as missing.
6. Never suggest the same cuisine type for more than one result — give variety across the set.
7. Be honest. "This is simple but satisfying" beats "Amazing restaurant-quality dish!"

OUTPUT FORMAT:
Respond ONLY with valid JSON matching this exact schema. No markdown, no preamble, no explanation outside the JSON.

{
  "meals": [
    {
      "id": "use the recipe id from the input data",
      "name": "Keep the original recipe name unless it's awkward — then improve it slightly",
      "pitch": "One warm sentence explaining why this works with their specific ingredients.",
      "timeEstimate": "~20 min",
      "steps": [
        "Step 1 written as a clear, friendly instruction adapted to their ingredients.",
        "Step 2.",
        "Step 3."
      ],
      "toolSuggestion": "wok | sheet pan | cast iron skillet | null",
      "missingCount": 0
    }
  ]
}`

const FALLBACK_SYSTEM_PROMPT = `You are a warm, practical cooking assistant helping busy parents figure out dinner with whatever they have on hand.

The user will give you a list of ingredients. Your job is to suggest dinner ideas they can make tonight.

RULES:
1. Only suggest meals that can be made with the provided ingredients plus common pantry staples (salt, pepper, oil, butter, garlic, basic dried spices, soy sauce, vinegar). Do NOT assume specialty ingredients.
2. If an important ingredient is missing, mention a simple substitute — don't pretend the gap doesn't exist.
3. Prioritize meals that take 30 minutes or less unless the user specifies otherwise.
4. Keep the tone warm and encouraging, like a friend who cooks — not clinical.
5. Be honest. "This is simple but satisfying" is better than overselling.
6. Never suggest the same cuisine type for all ideas — give variety.
7. Set missingCount to the number of non-pantry-staple ingredients this recipe needs that the user did NOT provide.
8. Set missingIngredientNames to the actual names of those missing non-pantry-staple ingredients (max 5). Empty array if none.

OUTPUT FORMAT:
Respond ONLY with valid JSON matching this exact schema. No markdown, no preamble, no explanation outside the JSON.

{
  "meals": [
    {
      "id": "generated-1",
      "name": "Meal Name",
      "pitch": "One warm sentence explaining why this works with their ingredients.",
      "timeEstimate": "~20 min",
      "steps": [
        "Step 1 written as a clear, friendly instruction.",
        "Step 2.",
        "Step 3."
      ],
      "toolSuggestion": "one common kitchen tool that would help — or null",
      "missingCount": 0,
      "missingIngredientNames": ["ingredient1", "ingredient2"]
    }
  ]
}`

// ---------------------------------------------------------------------------
// Role 1: Normalize messy user input → clean ingredient list for Spoonacular
// ---------------------------------------------------------------------------

export async function normalizeIngredients(rawInput: string): Promise<string[]> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    system: NORMALIZATION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: rawInput }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) throw new Error('Normalization did not return an array')
  return parsed as string[]
}

// ---------------------------------------------------------------------------
// Role 2: Enrich Spoonacular results with warm pitch + adapted steps
// ---------------------------------------------------------------------------

export async function enrichRecipes(
  normalizedIngredients: string[],
  spoonacularResults: SpoonacularRecipe[],
  filters: string[]
): Promise<ClaudeEnrichment> {
  const filtersLine =
    filters.length > 0 ? `\nDietary needs: ${filters.join(', ')}` : ''

  const recipeContext = spoonacularResults.map((r) => ({
    id: String(r.id),
    title: r.title,
    usedIngredients: r.usedIngredients.map((i) => i.name),
    missedIngredients: r.missedIngredients.map((i) => i.name),
    readyInMinutes: r.readyInMinutes,
    steps:
      r.analyzedInstructions?.[0]?.steps.map((s) => s.step) ?? [],
  }))

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3072,
    system: ENRICHMENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `The user has these ingredients: ${normalizedIngredients.join(', ')}${filtersLine}\n\nHere are the recipe matches from the database:\n${JSON.stringify(recipeContext, null, 2)}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  return ClaudeEnrichmentSchema.parse(parsed)
}

// ---------------------------------------------------------------------------
// Role 3: Fallback — generate meals from scratch when Spoonacular has no match
// ---------------------------------------------------------------------------

export async function generateFallbackRecipes(
  normalizedIngredients: string[],
  filters: string[],
  count: number
): Promise<ClaudeEnrichment> {
  const filtersLine =
    filters.length > 0 ? `\nDietary needs: ${filters.join(', ')}` : ''

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3072,
    system: FALLBACK_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `My ingredients: ${normalizedIngredients.join(', ')}${filtersLine}\n\nPlease suggest exactly ${count} dinner idea${count > 1 ? 's' : ''}.`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  return ClaudeEnrichmentSchema.parse(parsed)
}
