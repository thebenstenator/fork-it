# Prompt Engineering Guide

> The prompt is the product. This file documents the Claude API prompts, their rationale, and how to iterate on them.
>
> **Important context:** Claude has two distinct roles in this app. Read both sections carefully before writing any prompt code.

---

## Claude's Two Roles

### Role 1: Input Normalization
A small, fast, cheap call that runs *before* the Spoonacular query. Converts messy user text into a structured ingredient list.

### Role 2: Recipe Enrichment
The main call. Receives Spoonacular recipe data as context and enriches it with a warm pitch, adapted steps, and affiliate signals. Falls back to full recipe generation if Spoonacular has fewer than 3 good matches.

---

## Role 1: Input Normalization

### Purpose
Spoonacular's recipe search works best with clean, specific ingredient names. Users type messily. This step bridges the gap.

### System Prompt
```
You are an ingredient parser. Convert the user's messy, colloquial ingredient list into a clean, comma-separated list of specific ingredient names.

RULES:
1. Return ONLY a JSON array of strings — no explanation, no preamble.
2. Standardize quantities and descriptors: "some leftover rotisserie chicken" → "cooked chicken"
3. Resolve vague references: "that can of beans I've had forever" → "black beans"
4. Preserve specificity where it matters: "ground beef" stays "ground beef", not just "beef"
5. Remove non-ingredient text: "I think I have...", "there's some...", "maybe..."
6. If an item is clearly not a food ingredient, omit it.
7. Maximum 12 ingredients in the output — use the most significant ones if the user lists more.
```

### User Prompt Template
```
{rawUserInput}
```

### Example
Input: `"some leftover rotisserie chicken, half an onion, that can of beans I've had forever, rice, I think there's some soy sauce"`

Output: `["cooked chicken", "onion", "black beans", "rice", "soy sauce"]`

### Cost Profile
- Input: ~150 tokens (system + user message)
- Output: ~20–40 tokens
- Negligible cost — this call is fast and cheap

---

## Role 2: Recipe Enrichment (Hybrid Mode)

### Purpose
Receives Spoonacular recipe results and transforms them into the warm, adapted, human-feeling cards the user sees. This is where the personality lives.

### System Prompt
```
You are a warm, practical cooking assistant helping busy parents figure out dinner with whatever they have on hand.

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
}
```

### User Prompt Template
```
The user has these ingredients: {normalizedIngredients}

{filtersLine}

Here are the recipe matches from the database:
{edamamResults}

Please enrich these recipes as described.
```

Where `{filtersLine}` is either empty or: `Dietary needs: vegetarian, gluten-free`

And `{edamamResults}` is a compact JSON summary of the Spoonacular response (name, ingredients, steps, missing ingredients).

---

## Role 2: Recipe Generation (Fallback Mode)

Used when Spoonacular returns fewer than 3 results with a reasonable match score. Claude generates the missing cards from scratch in the same schema.

### When Fallback Triggers
- Spoonacular returns 0 results → generate all 3 from Claude
- Spoonacular returns 1–2 results → Claude enriches those + generates the remainder
- Spoonacular match score is very low (< 30% ingredients matched) → treat as no result, generate from scratch

### System Prompt (Fallback)
```
You are a warm, practical cooking assistant helping busy parents figure out dinner with whatever they have on hand.

The user will give you a list of ingredients. Your job is to suggest dinner ideas they can make tonight.

RULES:
1. Only suggest meals that can be made with the provided ingredients plus common pantry staples (salt, pepper, oil, butter, garlic, basic dried spices, soy sauce, vinegar). Do NOT assume specialty ingredients.
2. If an important ingredient is missing, mention a simple substitute — don't pretend the gap doesn't exist.
3. Prioritize meals that take 30 minutes or less unless the user specifies otherwise.
4. Keep the tone warm and encouraging, like a friend who cooks — not clinical.
5. Be honest. "This is simple but satisfying" is better than overselling.
6. Never suggest the same cuisine type for all ideas — give variety.

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
      "missingCount": 0
    }
  ]
}
```

---

## Affiliate Signal Logic

After enrichment, the API route applies these rules server-side (not Claude's job):

| Condition | Action |
|---|---|
| `toolSuggestion` is not null | Look up tool in `affiliates.ts` map → attach Amazon link |
| `missingCount` === 1–2 | Look up missing ingredient(s) in pantry staples affiliate list → attach "grab it for next time" link |
| `missingCount` >= 3 | Set `showMealKitOffer: true` on the meal card → frontend renders HelloFresh/EveryPlate offer |
| `missingCount` === 0 | No affiliate triggers except tool suggestion |

---

## Response Validation (Zod Schema)

```typescript
import { z } from 'zod'

const MealSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  pitch: z.string().min(1).max(300),
  timeEstimate: z.string(),
  imageUrl: z.string().url().nullable(),   // from Spoonacular; null for AI-generated
  matchScore: z.object({
    have: z.number().int().min(0),
    total: z.number().int().min(1),
  }).nullable(),                            // null for AI-generated cards
  missingIngredients: z.array(z.string()), // from Spoonacular
  steps: z.array(z.string()).min(2).max(12),
  toolSuggestion: z.string().nullable(),
  missingCount: z.number().int().min(0),
  showMealKitOffer: z.boolean().default(false),
})

const SuggestResponseSchema = z.object({
  meals: z.array(MealSchema).min(1).max(3),
  source: z.enum(['hybrid', 'ai', 'cache']),
})
```

Always parse Claude's response through this schema before returning to the client. If parsing fails, log the raw response server-side and return a generic error — never expose raw Claude output.

---

## Prompt Iteration Notes

### What Works Well
- Telling Claude to give variety across cuisine types prevents 3 pasta dishes
- Defining pantry staples explicitly prevents Claude from flagging salt and pepper as "missing"
- "Common pantry staples" definition prevents Claude from assuming exotic ingredients
- Asking for `toolSuggestion: null` when not applicable prevents hallucinated suggestions

### Known Issues & Workarounds
- Claude occasionally writes steps that assume specialty equipment — if this pattern appears, add "Do not assume the user has specialty appliances (stand mixer, food processor, blender)" to the rules
- Very sparse ingredient lists (1–2 items) produce weak Spoonacular results and weak Claude fallbacks — validate a minimum of 3 ingredients on the frontend before allowing submission
- Claude may over-adapt steps and drift from the actual recipe — instruct it to stay close to the original recipe structure when in enrichment mode

### Testing Inputs to Use During Development
```
# Typical
"chicken breast, rice, frozen broccoli, soy sauce, garlic"

# Messy/colloquial (normalization step must handle this)
"some leftover rotisserie chicken, half an onion, that can of beans I've had forever, rice"

# Very sparse — should show warning, Spoonacular will struggle
"eggs, cheese"

# Vegetarian with filter
"tofu, spinach, coconut milk, rice" + vegetarian filter

# Almost nothing
"pasta, butter"

# Lots of random stuff
"ground beef, zucchini, tomato paste, mozzarella, lasagna noodles, ricotta"

# Missing many ingredients — should trigger meal kit offer
"pasta" (only 1 ingredient, missing 3+ for any real recipe)
```

---

## Rate Limiting Strategy

To prevent API cost abuse:

```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per IP per hour
  analytics: true,
})
```

Check rate limit before any external API call. Return a 429 with a friendly message if exceeded.

---

## Cost Estimation

### Per Request (Hybrid Mode, No Cache)
| Call | Tokens | Approx. Cost |
|---|---|---|
| Claude normalization | ~200 in / ~30 out | ~$0.0003 |
| Spoonacular recipe search | — | ~$0.001 (or free tier) |
| Claude enrichment | ~800 in / ~500 out | ~$0.007 |
| **Total per uncached request** | — | **~$0.008** |

At 15 regular users × 2 searches/day × 30 days = ~900 requests/month ≈ **$7–10/month total** (mostly Claude enrichment).

Redis caching of common ingredient combinations will reduce this significantly in practice.

### Spoonacular Free Tier Reality
150 points/day free. Each uncached user search costs roughly **6–9 points** (findByIngredients + 3× recipe information calls). That's ~17–25 uncached searches per day before hitting the ceiling.

Redis caching is what makes this workable. After the first few days, common ingredient combos are cached and never hit Spoonacular again. In practice, a small user base with good caching should consume well under 50 points/day.
