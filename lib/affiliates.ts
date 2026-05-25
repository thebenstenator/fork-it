// ---------------------------------------------------------------------------
// Affiliate link mapping — see specs/ROADMAP.md Slice 4 for full spec.
// All links are pre-curated. Claude suggests the category; we map to the URL.
// Never use AI-generated affiliate URLs.
//
// TODO (Slice 4): Replace placeholder URLs with real Amazon Associates links
// once the affiliate account is approved.
// ---------------------------------------------------------------------------

const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG ?? ''
const HELLOFRESH_ID = process.env.HELLOFRESH_AFFILIATE_ID ?? ''

function amazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`
}

// ---------------------------------------------------------------------------
// Kitchen tool → affiliate link
// Claude returns a tool name string; we map it to a specific product.
// ---------------------------------------------------------------------------

const TOOL_LINKS: Record<string, { label: string; url: string }> = {
  wok: {
    label: 'wok',
    url: amazonUrl('B0000CF5HH'), // placeholder ASIN
  },
  'sheet pan': {
    label: 'sheet pan',
    url: amazonUrl('B0000VLGZ2'),
  },
  'cast iron skillet': {
    label: 'cast iron skillet',
    url: amazonUrl('B00006JSUA'),
  },
  'dutch oven': {
    label: 'Dutch oven',
    url: amazonUrl('B00009V2QK'),
  },
  'instant pot': {
    label: 'Instant Pot',
    url: amazonUrl('B00FLYWNYQ'),
  },
}

export function getToolAffiliateLink(
  toolSuggestion: string | null
): { label: string; url: string } | null {
  if (!toolSuggestion || !AFFILIATE_TAG) return null
  const key = toolSuggestion.toLowerCase()
  return TOOL_LINKS[key] ?? null
}

// ---------------------------------------------------------------------------
// Missing pantry ingredients → affiliate link
// Only for shelf-stable staples with reliable fast shipping.
// ---------------------------------------------------------------------------

const INGREDIENT_LINKS: Record<string, { label: string; url: string }> = {
  'soy sauce': {
    label: 'soy sauce',
    url: amazonUrl('B00BSZY4YI'),
  },
  'fish sauce': {
    label: 'fish sauce',
    url: amazonUrl('B000LD2SNE'),
  },
  'coconut milk': {
    label: 'coconut milk',
    url: amazonUrl('B000F4DXK2'),
  },
  'sesame oil': {
    label: 'sesame oil',
    url: amazonUrl('B00I5ELFL2'),
  },
  'oyster sauce': {
    label: 'oyster sauce',
    url: amazonUrl('B00FD5WOXM'),
  },
  'sriracha': {
    label: 'sriracha',
    url: amazonUrl('B00IZSP0PI'),
  },
}

export function getIngredientAffiliateLinks(
  missingIngredients: string[]
): Array<{ ingredient: string; url: string }> {
  if (!AFFILIATE_TAG) return []
  return missingIngredients
    .slice(0, 2) // max 2 ingredient links per card
    .map((ingredient) => {
      const key = ingredient.toLowerCase()
      const match = INGREDIENT_LINKS[key]
      return match ? { ingredient: match.label, url: match.url } : null
    })
    .filter(Boolean) as Array<{ ingredient: string; url: string }>
}

// ---------------------------------------------------------------------------
// Meal kit referral — triggered when missingCount >= 3
// ---------------------------------------------------------------------------

export function getMealKitUrl(): string {
  if (!HELLOFRESH_ID) return ''
  return `https://www.hellofresh.com/?c=${HELLOFRESH_ID}`
}
