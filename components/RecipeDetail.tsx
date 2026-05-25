import { type Meal } from '@/lib/types'

interface RecipeDetailProps {
  meal: Meal
}

export function RecipeDetail({ meal }: RecipeDetailProps) {
  return (
    <div className="mt-2 space-y-4 border-t border-stone-100 pt-4">
      {/* Steps */}
      <ol className="space-y-3">
        {meal.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-stone-700 leading-relaxed">
            <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {/* Affiliate block — only one appears per card, in priority order */}
      <div className="space-y-2 pt-1">
        {/* Meal kit offer — highest priority, shown when missing 3+ ingredients */}
        {meal.showMealKitOffer && (
          <AffiliateLink
            href={`https://www.hellofresh.com`} // replaced by real link in Slice 4
            label="Missing a few things? HelloFresh has something similar this week"
            emoji="🛒"
          />
        )}

        {/* Tool suggestion */}
        {!meal.showMealKitOffer && meal.toolSuggestion && meal.affiliateToolLink && (
          <AffiliateLink
            href={meal.affiliateToolLink}
            label={`A good ${meal.toolSuggestion} makes this easier`}
            emoji="💡"
          />
        )}

        {/* Missing ingredient links */}
        {!meal.showMealKitOffer &&
          meal.affiliateIngredientLinks?.map((link) => (
            <AffiliateLink
              key={link.ingredient}
              href={link.url}
              label={`Don't have ${link.ingredient}? Grab some for next time`}
              emoji="🛍️"
            />
          ))}
      </div>
    </div>
  )
}

function AffiliateLink({
  href,
  label,
  emoji,
}: {
  href: string
  label: string
  emoji: string
}) {
  return (
    <p className="text-xs text-stone-400">
      {emoji}{' '}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-amber-600 hover:underline"
      >
        {label} →
      </a>{' '}
      <span className="text-stone-300">(affiliate link)</span>
    </p>
  )
}
