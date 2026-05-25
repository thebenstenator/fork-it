# Forkit — Project Bible

> **For Claude Code:** Read this entire file before touching any code. This is the source of truth for all product decisions.

---

## The One-Line Pitch

Forkit (forkit.food) — a zero-friction dinner idea generator for stressed parents who haven't thought about dinner yet. Just type what's in your fridge and get real meal ideas in seconds.

---

## The Problem We're Solving

It's 5:30 PM. You're tired. The kids are asking what's for dinner. You open the fridge, stare at some chicken, half an onion, a can of beans, and leftover rice — and your brain goes blank.

Existing tools (SuperCook, Cooklist, etc.) require you to maintain a pantry inventory, pick ingredients from long dropdown lists, or scroll through cluttered recipe databases. That's not what this person needs right now.

**This person needs to text a knowledgeable friend.** Fast.

---

## Target User

**Primary:** Parents (especially moms) with kids, working full-time, who cook most weeknights but rarely plan ahead. They're not foodies. They want *good enough, tonight, with what I have.*

**Secondary:** Anyone doing a fridge clean-out, college students, budget-conscious cooks.

---

## Core Experience (Never Compromise This)

1. Land on the page — **no account required, no onboarding**
2. Type whatever's in your fridge in plain English (messy, incomplete, colloquial is fine)
3. Hit enter or tap the button
4. See **3 dinner ideas** within 3 seconds, each with:
   - Meal name
   - One-sentence "why this works" pitch
   - Rough time estimate (e.g. "~20 min")
   - Ingredient match indicator (e.g. "You have 7 of 9 ingredients")
5. Tap any idea to expand into a simple step-by-step recipe

That's the whole core loop. Protect it from feature creep.

---

## What This App Is NOT

- Not a pantry manager
- Not a meal planner
- Not a nutrition tracker
- Not a grocery list generator (at least not in v1)
- Not a recipe database browser
- Not a social/sharing platform
- Not a freemium product — the full experience is always free, no exceptions

---

## How It Works (The Hybrid Architecture)

This app uses two data sources working together, not Claude alone:

1. **Spoonacular Recipe Search API** — the recipe database. Returns real, verified recipes matched to the user's ingredients, with photos, match scores, and "missing ingredients" data.
2. **Claude API** — the personality and intelligence layer. Normalizes messy user input before the Spoonacular call, then enriches Spoonacular results with adapted steps, a warm pitch, and contextual tone. Falls back to pure Claude generation when Spoonacular has no good match.

**Why this matters over a Claude-only approach:**
- Spoonacular recipes are proven and sourced — not hallucinated
- Claude makes them feel human and adapted to your specific fridge
- The ingredient match score ("You have 6 of 8") is real data, not a guess
- Recipe photos prove these are real dishes

### Input Flow

```
User types messy ingredients
        ↓
Claude: normalize input → clean ingredient list
        ↓
Spoonacular: findByIngredients → top recipe matches with scores + images
        ↓
Claude: enrich top 3 results → pitch, adapted steps, tool suggestion
        (if Spoonacular returns < 3 matches, Claude generates the remainder)
        ↓
Cache full enriched response in Redis (24h)
        ↓
Frontend renders: photo, match score, pitch, adapted steps
```

---

## AI Behavior Guidelines

Claude is the **enrichment and personality layer**, not the recipe generator. Its two roles:

### Role 1: Input Normalization (cheap, fast)
- Convert messy user text into a clean ingredient list for Spoonacular
- "that can of beans I've had forever" → "black beans"
- "some leftover rotisserie chicken" → "cooked chicken"
- This is a small, fast call — not the main generation step

### Role 2: Recipe Enrichment (main call)
Claude receives Spoonacular recipe data as context and produces:
- **Warm pitch** — one sentence explaining why this recipe works with *their* specific ingredients
- **Adapted steps** — rewrites generic recipe steps to acknowledge what the user actually has
- **Gap acknowledgment** — if an ingredient is missing, mentions a simple substitute
- **Tool suggestion** — one kitchen tool that would help (for affiliate purposes), or null
- **Meal kit trigger** — flag if 3+ ingredients are missing (triggers meal kit affiliate suggestion)

### Role 3: Fallback Generation
When Spoonacular returns fewer than 3 good matches, Claude generates the remaining cards in the same schema and format. The user experience should be seamless — no visual distinction between database-backed and Claude-generated results.

### Tone Principles
- Warm and encouraging, like a friend who cooks — not clinical or robotic
- Honest: "This is simple but satisfying" beats "Amazing restaurant-quality dish!"
- Practical: meals a non-chef can make on a weeknight
- Flexible: if the user says "some leftover chicken," treat it as cooked chicken

---

## Monetization Strategy (Non-Intrusive)

**The product is completely free. No subscription. No freemium. No gating. Ever.**

All monetization is passive and contextual — it enhances the experience or doesn't appear at all.

### Tip Jar (Ko-fi)
- A single unobtrusive link in the footer: "Find this useful? Buy me a coffee ☕"
- No guilt, no pop-up, no repeated asks
- Covers infrastructure costs at small scale

### Affiliate Links (Slice 4)
Three contextual affiliate opportunities, all appearing only inside an expanded recipe:

**1. Kitchen tools (Amazon Associates)**
- Triggered by Claude's `toolSuggestion` field
- Example: "💡 A good wok makes this easier → [link]"
- Pre-curated list — Claude suggests the tool type, we map to a specific product link

**2. Missing ingredients (Amazon Associates / affiliate)**
- Triggered when the user is missing 1–2 key ingredients
- Example: "Don't have fish sauce? Grab some for next time → [link]"
- Only for pantry staples with fast delivery (soy sauce, fish sauce, coconut milk, etc.)
- Never shown if the user already has all ingredients

**3. Meal kit referral (HelloFresh / EveryPlate)**
- Triggered when the user is missing **3 or more** ingredients
- Flat referral fee: $10–20 per signup (much higher than product affiliate)
- Copy: "Missing a few things? HelloFresh has something similar this week → [link]"
- Only one meal kit suggestion per session, never repeated

### Affiliate Disclosure (Legal Requirement)
- A small "This page contains affiliate links" notice must be visible on any page that can show affiliate links
- FTC/UK ASA requirement — not optional
- Place in footer, small but legible

### Email Capture (Slice 5)
- After results load, a non-intrusive prompt: "Save tonight's ideas? Drop your email →"
- No account required — just a link to view saved meals
- Builds a re-engagement list for future use

### What We Will NEVER Do
- Subscription or paywall of any kind
- Ads (display, Google AdSense, etc.)
- Gating any part of the core experience
- Affiliate links that are random or non-contextual

---

## Brand Voice

- **Warm.** Like a friend, not an app.
- **Fast.** Never make the user wait or think more than necessary.
- **Honest.** Don't oversell a recipe. "This is pretty simple, it works" is better than "Amazing restaurant-quality dish!"
- **Uncluttered.** One job. Do it well.

---

## Success Metrics

- Time from landing to first result: **< 10 seconds**
- Core loop completable without an account: **always**
- Mobile usability: **first-class** (most use will be in the kitchen on a phone)
- Lighthouse performance score: **> 90**

---

## Key Constraints

- API keys must **never** be exposed client-side — all API calls go through the backend
- **Spoonacular ToS:** Must not represent Spoonacular data as your own. A small "Recipes via Spoonacular" note in the footer is sufficient — no mandatory badge unlike some other APIs
- Must function on slow mobile connections (lazy load, minimal JS bundle)
- Must be accessible (WCAG AA minimum)
- No dark patterns — no forced signups, no bait-and-switch
- Spoonacular images are hotlinked — always implement an image fallback for broken sources
