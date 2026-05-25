# Forkit — Design & UX Guidelines

> The design should feel like a calm, helpful friend — not an app. Fast, warm, uncluttered.

## Brand Identity

- **Name:** Forkit
- **Domain:** forkit.food
- **Tagline:** "Just fork it." (header) / "Fork what's in your fridge." (subhead)
- **Tone:** Slightly cheeky, warm, fast — the name has a wink to it without being juvenile

---

## Design Principles

1. **One job, one screen.** The entire core loop lives on a single page. No navigation needed.
2. **Mobile first.** Most users will be standing in their kitchen holding their phone.
3. **Calm under stress.** The user is already tired. The design should feel reassuring, not stimulating.
4. **Speed signals.** Everything about the visual design should communicate "this will be fast."

---

## Color Palette

```
Background:    #FAFAF8   (warm off-white — not sterile)
Surface:       #FFFFFF
Border:        #E8E4DC   (warm gray)
Text Primary:  #1C1917   (warm near-black)
Text Muted:    #78716C   (stone-500)
Accent:        #D97706   (amber-600 — warm, food-adjacent, not alarming)
Accent Light:  #FEF3C7   (amber-100 — for filter chips, highlights)
Success:       #65A30D   (lime-600)
Error:         #DC2626   (red-600)
```

Avoid: Cool blues, clinical whites, anything that feels like a medical or productivity app.

---

## Typography

```
Font:         Inter (system fallback: -apple-system, sans-serif)
Heading:      24px / 700 / tight leading
Subhead:      18px / 600
Body:         16px / 400 / relaxed leading (1.6)
Small:        14px / 400
Time badge:   13px / 500 / mono
```

---

## Component Specs

### Input Area
- Full-width textarea, 3 rows min, grows with content
- Placeholder: `"e.g. chicken thighs, half an onion, rice, whatever's in the back of your pantry..."`
- Submit button: full-width on mobile, inline on desktop
- Button label: `"What can I make?"` — not "Submit" or "Search"
- Button color: Accent amber, white text

### Meal Card (Collapsed)
- White card, subtle shadow, 12px border radius
- Recipe image: 16:9 thumbnail at top of card, with warm gray placeholder for missing/broken images
- Meal name: 18px bold
- Pitch: 15px, muted color, italic
- Time badge: small pill, amber-100 background, amber-700 text
- Ingredient match badge: "You have 7 of 9 ingredients" — small, muted, factual. Hidden for AI-generated fallback cards.
- "See how →" link at bottom right
- Hover state: slight shadow lift

### Meal Card (Expanded)
- Same card, expands in place with smooth animation
- Steps: numbered list, 16px, good line height
- Each step is its own visual block (subtle separator)
- **Affiliate block** at very bottom, visually de-emphasized — only one of these appears per card:
  - Tool suggestion: "💡 A good [tool] makes this easier → [link]"
  - Missing ingredient: "Don't have [ingredient]? Grab some for next time → [link]"
  - Meal kit offer (if 3+ missing): "Missing a few things? HelloFresh has something similar → [link]"
- Small "affiliate link" label on any linked item (legal disclosure)

### Filter Chips
- Small pill buttons below the input
- Default: outline style, muted text
- Active: amber-100 background, amber-700 text, amber border
- Icons optional but nice (🌿 Vegetarian, ⚡ Quick, 👶 Kid-Friendly)

### Loading State
- 3 skeleton cards that match the collapsed meal card dimensions
- Gentle pulse animation
- Small text below input: "Thinking about dinner..." (with ellipsis animation)

### Error State
- Inline below the input, not a modal
- Warm red icon + friendly message: "Hmm, something went wrong. Try again?"
- Retry button

---

## Layout

```
Mobile (< 640px):
  - Single column
  - Input + button stacked vertically
  - Cards full width, stacked

Desktop (≥ 640px):
  - Max width: 680px, centered
  - Input row: textarea + button side by side
  - Cards still stacked (not grid) — keeps reading flow

Page structure:
  [Header — app name + tagline]
  [Input area]
  [Filter chips]
  [Results area — 3 cards]
  [Ko-fi prompt — subtle, appears once after successful results, dismissible]
  [Footer — "Built by Ben Stenator" | Ko-fi link | forkit.food | "Recipes via Spoonacular" | Affiliate disclosure]
```

---

## Micro-interactions

- **Result reveal:** Cards animate in with a staggered fade-up (50ms delay between each)
- **Card expand:** Height animates open, not a snap
- **Filter chip toggle:** Quick scale pulse on click
- **Submit button:** Brief loading spinner replaces text while waiting
- **Input focus:** Subtle amber glow on the textarea border

---

## Copy Guidelines

| Element | Good | Bad |
|---|---|---|
| Input placeholder | "chicken thighs, rice, frozen peas..." | "Enter ingredients" |
| Submit button | "What can I make?" | "Search" / "Submit" |
| Loading | "Thinking about dinner..." | "Loading..." |
| Error | "Hmm, something went wrong. Try again?" | "Error 500" |
| Pitch text | "The soy sauce ties this together — it's a 15-minute win." | "A delicious and nutritious meal option." |
| Time badge | "~15 min" | "Estimated preparation time: 15 minutes" |
| Expand link | "See how →" | "View Recipe" |
| Affiliate | "💡 A good wok makes this easier" | "SPONSORED: Buy this product" |

---

## Accessibility

- All interactive elements keyboard-navigable
- Filter chips: `role="checkbox"` with `aria-checked`
- Loading state: `aria-live="polite"` region for results
- Color contrast: all text meets WCAG AA (4.5:1 minimum)
- Error messages associated with input via `aria-describedby`
- Skip to content link for screen readers
