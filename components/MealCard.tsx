'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecipeDetail } from './RecipeDetail'
import { HeartButton } from './HeartButton'
import { type Meal } from '@/lib/types'
import { type User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

interface MealCardProps {
  meal: Meal
  user: User | null
  isFavorited: boolean
  onToggleFavorite: (meal: Meal) => Promise<void>
}

export function MealCard({ meal, user, isFavorited, onToggleFavorite }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const expandButtonRef = useRef<HTMLButtonElement>(null)

  const showImage = meal.imageUrl && !imageError
  const matchPercent = meal.matchScore
    ? Math.round((meal.matchScore.have / meal.matchScore.total) * 100)
    : null

  // Escape key collapses the expanded card
  useEffect(() => {
    if (!isExpanded) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsExpanded(false)
        expandButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  return (
    <Card className={cn('overflow-hidden transition-shadow duration-200', 'hover:shadow-md')}>
      {/* Recipe image */}
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
          <div className="flex items-center gap-2 shrink-0">
            <HeartButton
              meal={meal}
              user={user}
              isFavorited={isFavorited}
              onToggle={onToggleFavorite}
            />
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-700 font-mono text-xs"
            >
              {meal.timeEstimate}
            </Badge>
          </div>
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

        {/* Expand / collapse toggle */}
        <button
          ref={expandButtonRef}
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Hide recipe ↑' : 'See how →'}
        </button>

        {/* Smooth expand/collapse */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="recipe-detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <RecipeDetail meal={meal} />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
