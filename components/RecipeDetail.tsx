'use client'

import posthog from 'posthog-js'
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

      {/* Affiliate block — only one category appears per card, in priority order */}
      <div className="space-y-2 pt-1">
        {/* Meal kit offer — highest priority, shown when missing 3+ ingredients */}
        {meal.showMealKitOffer && meal.mealKitUrl && (
          <AffiliateLink
            href={meal.mealKitUrl}
            label="Missing a few things? HelloFresh has something similar this week"
            emoji="🛒"
            trackAs="meal_kit"
            mealName={meal.name}
          />
        )}

        {/* Tool suggestion */}
        {!meal.showMealKitOffer && meal.toolSuggestion && meal.affiliateToolLink && (
          <AffiliateLink
            href={meal.affiliateToolLink}
            label={`A good ${meal.toolSuggestion} makes this easier`}
            emoji="💡"
            trackAs="tool"
            mealName={meal.name}
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
              trackAs="ingredient"
              mealName={meal.name}
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
  trackAs,
  mealName,
}: {
  href: string
  label: string
  emoji: string
  trackAs: 'meal_kit' | 'tool' | 'ingredient'
  mealName: string
}) {
  function handleClick() {
    posthog.capture('affiliate_link_clicked', {
      link_type: trackAs,
      meal_name: mealName,
      href,
    })
  }

  return (
    <p className="text-xs text-stone-400">
      {emoji}{' '}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-amber-600 hover:underline"
        onClick={handleClick}
      >
        {label} →
      </a>{' '}
      <span className="text-stone-300">(affiliate link)</span>
    </p>
  )
}
