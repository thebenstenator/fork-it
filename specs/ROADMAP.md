# Roadmap — Vertical Slices

> Each slice is a fully working, shippable increment. Build in order. Don't start slice N+1 until slice N is deployed and working.

---

## Slice 1 — The Core Loop (MVP)
**Goal:** A stranger can land on the site, type ingredients, and get 3 dinner ideas. Nothing else.

### Tasks
- [ ] Initialize Next.js 14 project with TypeScript, Tailwind, ESLint, Prettier
- [ ] Build `IngredientInput` component — single textarea, placeholder text that sets expectations ("e.g. chicken, rice, frozen peas, soy sauce"), submit button
- [ ] Build `POST /api/suggest` route handler:
  - Accept `{ ingredients: string, filters: string[] }`
  - Validate with Zod (min 2 chars, max 500 chars)
  - Check Upstash Redis cache (by normalized ingredient key) — return immediately if hit
  - Call Claude to normalize messy input → clean ingredient list
  - Call Spoonacular Recipe Search API with normalized ingredients
  - Call Claude to enrich top 3 Spoonacular results (or generate if < 3 matches)
  - Cache full enriched response in Redis (24h TTL)
  - Return `{ meals: Meal[], source: 'hybrid' | 'ai' | 'cache' }`
- [ ] Build `lib/spoonacular.ts` — Spoonacular API client with typed response parsing
- [ ] Build `lib/claude.ts` — normalization prompt + enrichment prompt (two separate functions)
- [ ] Build `lib/cache.ts` — Redis cache read/write helpers
- [ ] Engineer both Claude prompts (see PROMPT_ENGINEERING.md)
- [ ] Build `MealSuggestions` component — renders 3 `MealCard` components
- [ ] Build `MealCard` — meal name, pitch, time estimate, ingredient match badge, expand toggle
  - Match badge: "You have 7 of 9 ingredients" (from Spoonacular data; hidden for AI-generated cards)
  - Recipe image with fallback placeholder for broken/missing images
- [ ] Build `RecipeDetail` — numbered steps, shown when card is expanded
- [ ] Basic loading state (skeleton cards while waiting)
- [ ] Basic error state ("Something went wrong — try again")
- [ ] Mobile-first responsive layout
- [ ] Add "Recipes via Spoonacular" credit to footer (good practice per Spoonacular ToS)
- [ ] Add Ko-fi link to footer
- [ ] Deploy to Vercel

### Definition of Done
A real person on a phone can type ingredients and get useful meal ideas without confusion or errors. Spoonacular credit is in the footer. Ko-fi link is in the footer.

---

## Slice 2 — Polish & Performance
**Goal:** The experience feels fast, smooth, and trustworthy.

### Tasks
- [ ] Add Framer Motion animations — results animate in staggered, card expand is smooth
- [ ] Improve loading state — animated skeleton that looks like meal cards
- [ ] Add input character counter and validation feedback
- [ ] "Try an example" button that pre-fills the input with a realistic scenario
- [ ] Keyboard accessibility — Enter submits, Escape collapses expanded card
- [ ] Focus management — after results load, focus moves to first result
- [ ] Add rate limiting via Upstash Redis (max 10 requests/IP/hour)
- [ ] Add `<meta>` tags, OG image, favicon, page title
- [ ] Lighthouse audit — hit > 90 on performance, accessibility, best practices
- [ ] Add Vercel Analytics
- [ ] Ko-fi prompt — after results load successfully, show a subtle one-time prompt: "Find this useful? ☕ Buy me a coffee" — appears below results, dismissible, not repeated in same session

### Definition of Done
Lighthouse scores > 90. A user on a slow 3G connection still has a usable experience.

---

## Slice 3 — Dietary Filters
**Goal:** Users can quickly communicate constraints without typing them.

### Tasks
- [ ] Add optional filter chips below the input: `Vegetarian` `Dairy-Free` `Gluten-Free` `Quick (< 20 min)` `Kid-Friendly`
- [ ] Pass selected filters to the API — inject into Spoonacular search params AND Claude enrichment prompt
- [ ] Filters are toggleable, multi-select, and visually clear when active
- [ ] Remember selected filters in `localStorage` for return visits
- [ ] Add PostHog event tracking on filter usage to understand what people actually need

### Definition of Done
A user with dietary restrictions can get appropriate suggestions without typing their restrictions in the text box.

---

## Slice 4 — Affiliate Monetization
**Goal:** Earn non-intrusive, contextual revenue without compromising the core experience.

### Tasks
- [ ] Sign up for Amazon Associates
- [ ] Sign up for HelloFresh / EveryPlate affiliate program
- [ ] Build `lib/affiliates.ts` — maps tool names and ingredient names to pre-curated affiliate links
- [ ] **Kitchen tool links:** When `toolSuggestion` is not null, render at bottom of expanded recipe: "💡 A good [tool] makes this easier → [Amazon link]"
- [ ] **Missing ingredient links:** When user is missing 1–2 pantry staple ingredients, render: "Don't have [ingredient]? Grab some for next time → [Amazon link]" — only for stocked, fast-shipping pantry staples
- [ ] **Meal kit offer:** When `showMealKitOffer` is true (missing 3+ ingredients), render: "Missing a few things? HelloFresh has something similar this week → [referral link]" — one per session maximum
- [ ] Add affiliate disclosure notice to footer: "This page may contain affiliate links. We may earn a small commission at no cost to you."
- [ ] Track all affiliate link clicks with PostHog
- [ ] A/B test placement: bottom of recipe vs. inline within steps (tool links only)
- [ ] Clearly label affiliate links visually (small "ad" tag or disclosure text)

### Definition of Done
All three affiliate link types appear naturally and contextually. Disclosure is visible. No user sees affiliate content unless they expand a recipe.

---

## Slice 5 — Email Capture & Save
**Goal:** Convert one-time users into returning ones.

### Tasks
- [ ] Set up Supabase project and `saved_meals` + `subscribers` tables
- [ ] After results load, show non-intrusive prompt: "Save tonight's ideas? Drop your email →"
- [ ] On email submit: save current meal suggestions to Supabase, associate with email
- [ ] Send confirmation email via Resend with the saved ideas
- [ ] Build simple `/saved/:token` page to view saved meals (no account/login needed — just a link)
- [ ] Add Sentry for error monitoring

### Definition of Done
A user can get their meal ideas emailed to them without creating an account.

---

## Slice 6 — SEO & Growth
**Goal:** Get organic traffic from people searching "what can I make with chicken and rice" etc.

### Tasks
- [ ] Research 20–30 high-intent ingredient combination keywords
- [ ] Build a static `/ideas/[slug]` page for each (e.g. `/ideas/chicken-rice-beans`)
- [ ] Pre-generate content using Spoonacular + Claude enrichment at build time (SSG) — real recipes with real images
- [ ] Internal linking between related pages
- [ ] Submit sitemap to Google Search Console
- [ ] Write 2–3 blog posts targeting "what to make with [X]" long-tail queries
- [ ] Set up canonical URLs properly

### Definition of Done
At least 5 pages indexed and appearing in Google Search Console within 30 days of launch.

---

## Backlog (Future Consideration)

- **Cuisine selector** — "I'm in the mood for Mexican / Asian / Italian"
- **Serving size input** — "cooking for 2 / cooking for a family of 5"
- **"I don't want to use the stove"** — oven-only, microwave, air fryer modes
- **Recipe rating** — thumbs up/down to improve suggestions over time
- **Weekly digest email** — "Here are 5 dinner ideas based on what's usually in your fridge"
- **PWA / installable** — add to home screen for kitchen use
- **Voice input** — speak your ingredients (especially useful with messy hands)
- **Upgrade to Spoonacular paid tier** — if organic traffic from Slice 6 pushes past free tier limits
