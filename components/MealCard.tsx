'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecipeDetail } from './RecipeDetail'
import { type Meal } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MealCardProps {
  meal: Meal
}

export function MealCard({ meal }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const matchPercent =
    meal.matchScore
      ? Math.round((meal.matchScore.have / meal.matchScore.total) * 100)
      : null

  const showImage = meal.imageUrl && !imageError

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow duration-200',
        'hover:shadow-md'
      )}
    >
      {/* Recipe image — only rendered if URL exists and hasn't errored */}
      {showImage && (
        <div className="relative h-40 w-full bg-stone-100">
          <Image
            src={meal.imageUrl!}
            alt={meal.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-stone-900 leading-tight">
            {meal.name}
          </h2>
          <Badge
            variant="secondary"
            className="shrink-0 bg-amber-100 text-amber-700 font-mono text-xs"
          >
            {meal.timeEstimate}
          </Badge>
        </div>

        {/* Pitch */}
        <p className="text-sm text-stone-500 italic leading-relaxed">
          {meal.pitch}
        </p>

        {/* Ingredient match score */}
        {meal.matchScore && (
          <p className="text-xs text-stone-400">
            You have {meal.matchScore.have} of {meal.matchScore.total} ingredients
            {matchPercent !== null && matchPercent < 100 && (
              <span className="ml-1 text-amber-600">
                ({meal.missingIngredients.slice(0, 2).join(', ')}
                {meal.missingIngredients.length > 2 ? '…' : ''} missing)
              </span>
            )}
          </p>
        )}

        {/* Expand / collapse */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Hide recipe ↑' : 'See how →'}
        </button>

        {/* Expanded recipe detail */}
        {isExpanded && <RecipeDetail meal={meal} />}
      </CardContent>
    </Card>
  )
}
