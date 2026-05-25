# CLAUDE.md — Instructions for Claude Code

> Claude Code: Read this file first, then read `specs/PROJECT_BIBLE.md`, `specs/TECH_STACK.md`, and `specs/PROMPT_ENGINEERING.md` before writing any code.

---

## What This Project Is

A Next.js web app called **Forkit** (forkit.food) — a zero-friction dinner idea generator. Users type whatever's in their fridge and get 3 practical meal ideas instantly, backed by real verified recipes from Spoonacular and enriched with Claude's warm, adaptive personality layer.

**The core value is speed and zero friction. Never add complexity that slows the user down.**

---

## Coding Standards

### General
- **TypeScript everywhere.** No `any` types. Define interfaces in `lib/types.ts`.
- **Functional components only.** No class components.
- **No `console.log` in production code.** Use a proper logger or remove before committing.
- **Handle all error states explicitly.** Never let an unhandled promise rejection reach the user.

### File Naming
- Components: `PascalCase.tsx`
- Utilities/hooks/lib: `camelCase.ts`
- API routes: Next.js convention (`route.ts`)

### Component Patterns
- Keep components focused — if a component is doing more than one thing, split it
- Co-locate component-specific types with the component file unless shared
- Use `cn()` (from `clsx` + `tailwind-merge`) for conditional class names

### API Routes
- Always validate input with Zod before processing
- Always check rate limit AND Redis cache before calling any external API
- Never expose raw API errors to the client — log server-side, return a generic message
- Return consistent error shapes: `{ error: string, code: string }`

---

## The Hybrid API Architecture

This app uses **two data sources**, not Claude alone. Order of operations in `app/api/suggest/route.ts`:

1. Validate input (Zod)
2. Check rate limit (Upstash)
3. Check Redis cache — return immediately if hit
4. **Claude:** normalize messy input → clean ingredient list (`lib/claude.ts` → `normalizeIngredients()`)
5. **Spoonacular:** search recipes by normalized ingredients (`lib/edamam.ts` → `searchRecipes()`)
6. **Claude:** enrich top 3 Spoonacular results with pitch + adapted steps (`lib/claude.ts` → `enrichRecipes()`)
   - If Spoonacular returns < 3 good matches, Claude generates the remainder (`generateFallbackRecipes()`)
7. Apply affiliate signal logic server-side (`lib/affiliates.ts`)
8. Cache full enriched response in Redis (24h TTL)
9. Return to client

See `specs/PROMPT_ENGINEERING.md` for all Claude prompts. See `specs/TECH_STACK.md` for the full response schema.

```typescript
// lib/claude.ts — sketch of the two Claude functions
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic() // reads ANTHROPIC_API_KEY from env automatically

// Role 1: Normalize messy user text into clean ingredient names for Spoonacular
export async function normalizeIngredients(rawInput: string): Promise<string[]> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    system: NORMALIZATION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: rawInput }]
  })
  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
  return JSON.parse(raw) as string[]
}

// Role 2: Enrich Spoonacular results with warm pitch + adapted steps
export async function enrichRecipes(
  normalizedIngredients: string[],
  edamamResults: SpoonacularRecipe[],
  filters: string[]
): Promise<EnrichedMeals> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: ENRICHMENT_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: buildEnrichmentPrompt(normalizedIngredients, edamamResults, filters)
    }]
  })
  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  return EnrichedMealsSchema.parse(parsed) // throws if invalid — catch and return generic error
}
```

---

## What NOT to Build (Scope Guard)

Claude Code, do not add these without explicit instruction:
- User authentication or accounts
- A database (until Slice 5)
- Recipe favoriting or saving (until Slice 5)
- Social sharing features
- Nutritional information display
- A grocery list generator
- Any admin dashboard
- Subscription or paywall of any kind — the app is always fully free

If a feature isn't in the current slice in `specs/ROADMAP.md`, don't build it.

---

## Environment Setup

Required `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
EDAMAM_APP_ID=...
EDAMAM_APP_KEY=...
```

Slice 2+:
```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_POSTHOG_KEY=...
```

Slice 4+:
```
AMAZON_AFFILIATE_TAG=...
HELLOFRESH_AFFILIATE_ID=...
```

Slice 5+:
```
SENTRY_DSN=...
```

> **Spoonacular note:** Sign up at developer.edamam.com for the **Recipe Search API** specifically. Not the Nutrition API or Food Database API — those are different products.

---

## Third-Party Attributions (Required)

- **Spoonacular:** Must display "Powered by Spoonacular" badge visibly on any page showing recipe results. This is a ToS requirement, not optional. Badge asset lives in `public/edamam-badge.svg`.
- **Affiliate links:** Must include visible disclosure text — "This page may contain affiliate links." Lives in the footer on all pages.

---

## Git Conventions

- Branch: `slice/1-core-loop`, `slice/2-polish`, etc.
- Commits: conventional commits — `feat:`, `fix:`, `chore:`, `docs:`
- PRs: one slice = one PR (squash merge)

---

## Definition of Done (Per Slice)

A slice is done when:
1. All tasks in `specs/ROADMAP.md` for that slice are checked off
2. Core user flow works on mobile (test in Chrome DevTools mobile view)
3. No TypeScript errors (`tsc --noEmit` passes)
4. No ESLint errors
5. Spoonacular attribution badge is visible
6. Deployed to Vercel preview URL and manually tested
