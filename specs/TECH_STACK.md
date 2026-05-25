# Tech Stack

> Chosen for production-readiness, developer experience, and portfolio signal — not just familiarity.

---

## Frontend

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR/SSG out of the box, API routes built in, excellent performance defaults, strong portfolio signal |
| Language | **TypeScript** | Type safety catches bugs early, expected in senior roles |
| Styling | **Tailwind CSS** | Rapid iteration, consistent design system, no CSS file sprawl |
| UI Components | **shadcn/ui** | Accessible, unstyled-by-default, copy-paste components you own |
| Animations | **Framer Motion** | Smooth result reveal animations without complexity |
| State | **Zustand** | Lightweight, simple, avoids Redux overhead for this scale |
| Forms | **React Hook Form** | Minimal re-renders, clean validation |

---

## Backend

| Layer | Choice | Why |
|---|---|---|
| Runtime | **Next.js API Routes / Route Handlers** | Keeps the repo unified, no separate Express server needed |
| Recipe Database | **Spoonacular API** | Free tier: 150 points/day. Verified recipes with images, ingredient match scoring, used/missing ingredient data. Aggressive Redis caching keeps actual daily calls well under the limit. |
| AI Enrichment | **Anthropic Claude API (claude-sonnet-4-6)** | Normalizes messy user input, enriches Spoonacular results with warm pitch + adapted steps, falls back to full generation when Spoonacular has no good match |
| Rate Limiting | **Upstash Redis + @upstash/ratelimit** | Serverless-friendly, prevents API cost abuse, free tier available |
| Response Cache | **Upstash Redis** | Cache full enriched responses (Spoonacular + Claude) by normalized ingredient key for 24h — critical for staying within the 150 point/day free tier |
| Input Validation | **Zod** | Runtime type safety on API inputs, pairs well with TypeScript |

---

## Infrastructure

| Layer | Choice | Why |
|---|---|---|
| Hosting | **Vercel** | Zero-config Next.js deployment, preview deployments per PR, free tier generous |
| Database (Slice 5) | **Supabase (PostgreSQL)** | For saved meals + email capture — you already know this from BoardFoot |
| Email (Slice 5) | **Resend** | Developer-friendly transactional email, generous free tier |
| Analytics | **Vercel Analytics + PostHog** | Privacy-friendly, see where users drop off |
| Error Tracking | **Sentry** | Know when things break in production |
| Tip Jar | **Ko-fi** | Single footer link, no integration required |

---

## Dev Tooling

| Tool | Purpose |
|---|---|
| **ESLint + Prettier** | Code quality and formatting |
| **Husky + lint-staged** | Pre-commit hooks to enforce quality |
| **Vitest** | Unit testing for prompt logic and utilities |
| **Playwright** | E2E testing for the core user flow |
| **GitHub Actions** | CI/CD — lint, test, deploy on push |

---

## Project Structure

```
forkit/
├── app/
│   ├── page.tsx                  # Landing + main input
│   ├── api/
│   │   └── suggest/
│   │       └── route.ts          # Orchestrates Edamam + Claude calls
│   └── layout.tsx
├── components/
│   ├── IngredientInput.tsx       # Main text input component
│   ├── MealSuggestions.tsx       # Results list
│   ├── MealCard.tsx              # Individual meal + expand/collapse
│   └── RecipeDetail.tsx          # Expanded step-by-step view
├── lib/
│   ├── claude.ts                 # Anthropic client — normalization + enrichment prompts
│   ├── spoonacular.ts            # Spoonacular API client + recipe search
│   ├── ratelimit.ts              # Upstash rate limiter setup
│   ├── cache.ts                  # Upstash Redis response cache
│   ├── affiliates.ts             # Tool suggestion → affiliate link mapping
│   └── types.ts                  # Shared TypeScript types
├── hooks/
│   └── useMealSuggestions.ts     # Fetch hook for the API call
└── public/
    └── edamam-badge.svg          # Required Edamam attribution asset
```

---

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
SPOONACULAR_API_KEY=...

# Slice 2+
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_POSTHOG_KEY=...

# Slice 4+
AMAZON_AFFILIATE_TAG=...
HELLOFRESH_AFFILIATE_ID=...

# Slice 5+
SENTRY_DSN=...
```

> **Spoonacular API note:** Sign up at spoonacular.com/food-api. The free tier gives 150 points/day. **Point costs matter** — `findByIngredients` costs 1 point per result returned, and `GET /recipes/{id}/information` costs 1 point per call. Each user search (find 3 recipes + fetch full details for each) costs roughly 6–9 points. Redis caching is not optional — it's what keeps you inside the free tier.

---

## API Design

### `POST /api/suggest`

**Request:**
```json
{
  "ingredients": "some leftover chicken, half an onion, can of black beans, rice",
  "filters": ["gluten-free"]
}
```

**Internal flow:**
1. Validate input with Zod
2. Check rate limit (Upstash)
3. Check Redis cache — if hit, return cached response immediately (no Spoonacular points spent)
4. Call Claude to normalize ingredients: messy text → clean list
5. Call Spoonacular `GET /recipes/findByIngredients` with normalized ingredients
6. Call Spoonacular `GET /recipes/{id}/information` for each match to get full steps + images
7. Call Claude to enrich top 3 Spoonacular results (or generate if < 3 good matches)
8. Cache full enriched response in Redis (24h TTL)
9. Return enriched meals to client

**Response:**
```json
{
  "meals": [
    {
      "id": "edamam-recipe-id-or-generated",
      "name": "Quick Chicken & Black Bean Rice Bowl",
      "pitch": "The beans and rice make this surprisingly filling — it comes together in one pan.",
      "timeEstimate": "~15 min",
      "imageUrl": "https://edamam-image-url.jpg",
      "matchScore": { "have": 7, "total": 9 },
      "missingIngredients": ["fish sauce"],
      "steps": [
        "Dice the onion and sauté in oil over medium heat until soft, about 3 minutes.",
        "Add the chicken (shredded or chopped) and warm through.",
        "Drain and rinse the black beans, add to the pan.",
        "Season with cumin, salt, pepper, and a splash of water if it looks dry.",
        "Serve over rice. Top with hot sauce if you have it."
      ],
      "toolSuggestion": "cast iron skillet",
      "showMealKitOffer": false
    }
  ],
  "source": "hybrid"
}
```

> `source` is `"hybrid"` (Edamam + Claude), `"ai"` (Claude-only fallback), or `"cache"` (Redis hit). Only used for internal logging — never exposed in the UI.
