'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type SuggestResponse } from '@/lib/types'
import { MealCard } from './MealCard'
import { MealCardSkeleton } from './MealCardSkeleton'

interface MealSuggestionsProps {
  data: SuggestResponse | null
  isLoading: boolean
  error: string | null
}

export function MealSuggestions({ data, isLoading, error }: MealSuggestionsProps) {
  const firstCardRef = useRef<HTMLDivElement>(null)

  // Focus the first card when results load
  useEffect(() => {
    if (data && firstCardRef.current) {
      firstCardRef.current.focus()
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-4" aria-live="polite" aria-label="Loading meal suggestions">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-stone-500 text-center"
        >
          Thinking about dinner...
        </motion.p>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <MealCardSkeleton />
          </motion.div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-red-200 bg-red-50 p-4"
        role="alert"
      >
        <p className="text-sm text-red-700">
          Hmm, something went wrong. {error}
        </p>
      </motion.div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4" aria-live="polite">
      <AnimatePresence>
        {data.meals.map((meal, index) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3, ease: 'easeOut' }}
            ref={index === 0 ? firstCardRef : undefined}
            tabIndex={index === 0 ? -1 : undefined}
          >
            <MealCard meal={meal} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
