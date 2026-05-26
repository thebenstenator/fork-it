# Roadmap — Vertical Slices

> Each slice is a fully working, shippable increment. Build in order. Don't start slice N+1 until slice N is deployed and working.

---

## Slice 1 — The Core Loop (MVP) ✅
**Goal:** A stranger can land on the site, type ingredients, and get 3 dinner ideas. Nothing else.

### Tasks
- [x] Initialize Next.js project with TypeScript, Tailwind, ESLint, Prettier
- [x] Build `IngredientInput` component — single textarea, placeholder text, submit button
- [x] Build `POST /api/suggest` route handler (Zod validation, cache, Claude normalize, Spoonacular, Claude enrich, cache write)
- [x] Build `lib/spoonacular.ts` — Spoonacular API client with typed response parsing
- [x] Build `lib/claude.ts` — normalization prompt + enrichment prompt
- [x] Build `lib/cache.ts` — Redis cache read/write helpers
- [x] Build `MealSuggestions` + `MealCard` components
- [x] Basic loading, error states, mobile-first layout
- [x] "Recipes via Spoonacular" credit in footer
- [x] Ko-fi link in footer
- [x] Deploy to Vercel

---

## Slice 2 — Polish & Performance ✅
**Goal:** The experience feels fast, smooth, and trustworthy.

### Tasks
- [x] Framer Motion animations — staggered results, smooth card expand
- [x] Animated skeleton loading state
- [x] Input character counter and validation feedback
- [x] "Try an example" button
- [x] Keyboard accessibility (Enter submits, Escape collapses)
- [x] Focus management after results load
- [x] Rate limiting via Upstash Redis (10 req/IP/hour)
- [x] Meta tags, OG image, favicon, page title
- [x] Vercel Analytics
- [x] Ko-fi dismissible prompt after first results load
- [x] PWA / installable (moved up from backlog)

---

## Slice 3 — Dietary Filters ✅
**Goal:** Users can quickly communicate constraints without typing them.

### Tasks
- [x] Filter chips: `Vegetarian` `Dairy-Free` `Gluten-Free` `Quick (< 20 min)` `Kid-Friendly`
- [x] Filters passed to Spoonacular search params + Claude enrichment prompt
- [x] Toggleable, multi-select, visually clear active state
- [x] Filters persisted in `localStorage`
- [x] PostHog event tracking on filter usage

---

## Slice 4 — Affiliate Monetization
**Goal:** Earn non-intrusive, contextual revenue without compromising the core experience.

### Tasks
- [ ] Sign up for Amazon Associates
- [ ] Sign up for HelloFresh / EveryPlate affiliate program
- [ ] Replace placeholder ASINs in `lib/affiliates.ts` with real affiliate links
- [ ] **Kitchen tool links:** When `toolSuggestion` is not null, render at bottom of expanded recipe: "💡 A good [tool] makes this easier → [Amazon link]"
- [ ] **Missing ingredient links:** When user is missing 1–2 pantry staple ingredients, render: "Don't have [ingredient]? Grab some for next time → [Amazon link]"
- [ ] **Meal kit offer:** When `showMealKitOffer` is true (missing 3+), render: "Missing a few things? HelloFresh has something similar this week → [referral link]" — once per session max
- [ ] Add affiliate disclosure notice to footer
- [ ] Track affiliate link clicks with PostHog
- [ ] Clearly label affiliate links (small "ad" tag or disclosure text)

### Definition of Done
All three affiliate link types appear naturally and contextually. Disclosure is visible. No user sees affiliate content unless they expand a recipe.

---

## Slice 5 — History & Accounts
**Goal:** Let users revisit past results for free; let motivated users save favorites across sessions.

### Two-tier design
- **History** — free, no account required, automatic. Stored in `localStorage`.
- **Favorites** — requires a free account. Stored in Supabase. No password ever — magic link only.

### Tasks

#### History (localStorage, everyone)
- [ ] On every successful `/api/suggest` response, push the result to `localStorage["forkit:history"]`
  - Store: `{ id, ingredients, filters, meals, searchedAt }`
  - Cap at 20 entries (trim oldest when over limit)
- [ ] Build `/history` page — shows last 20 searches as compact cards (meal names + ingredient snippet + date)
- [ ] Clicking a history card re-expands the full results inline (reads from localStorage — no API call)
- [ ] Add "History" link to nav/footer (only visible if `forkit:history` has entries)
- [ ] "Clear history" button on `/history` page

#### Accounts & Favorites (Supabase auth, opt-in)
- [ ] Set up Supabase project — `favorites` table: `(id, user_id, meal_data jsonb, saved_at)`
- [ ] Add magic-link email auth via Supabase Auth (no passwords, no forms beyond email input)
- [ ] Heart button (♡) on each `MealCard` — visible always, triggers sign-in prompt if not authenticated
- [ ] Sign-in flow: modal overlay → "Enter your email, we'll send you a link" → done. No password.
- [ ] On heart click (authenticated): save meal to Supabase `favorites`, optimistic UI update
- [ ] Build `/favorites` page — shows saved meals as full cards, accessible after sign-in
- [ ] "Remove from favorites" on `/favorites` page
- [ ] Returning users auto-signed-in via Supabase session cookie — no friction on repeat visits
- [ ] Add Sentry for error monitoring

### Definition of Done
Any user can see their last 20 searches without touching an account. A user who signs up (magic link only) can heart recipes and find them again at `/favorites` from any device.

---

## Slice 6 — SEO & Growth
**Goal:** Get organic traffic from people searching "what can I make with chicken and rice" etc.

### Tasks
- [ ] Research 20–30 high-intent ingredient combination keywords
- [ ] Build a static `/ideas/[slug]` page for each (e.g. `/ideas/chicken-rice-beans`)
- [ ] Pre-generate content using Spoonacular + Claude enrichment at build time (SSG)
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
- **Weekly digest email** — "Here are 5 dinner ideas based on what's usually in your fridge" (for signed-in users)
- **Voice input** — speak your ingredients (especially useful with messy hands)
- **Upgrade to Spoonacular paid tier** — if organic traffic from Slice 6 pushes past free tier limits
- **Export / share** — shareable link or PDF for a result set
