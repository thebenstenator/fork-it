'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type User } from '@supabase/supabase-js'
import { MealCard } from './MealCard'
import { type HistoryEntry } from '@/lib/history'
import { type Meal } from '@/lib/types'

interface HistoryCardProps {
  entry: HistoryEntry
  user: User | null
  isFavorited: (mealId: string) => boolean
  onToggleFavorite: (meal: Meal) => Promise<void>
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`
  if (diffDays < 2) return 'Yesterday'
  if (diffDays < 7) return `${Math.floor(diffDays)} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max).trimEnd() + '…' : str
}

export function HistoryCard({ entry, user, isFavorited, onToggleFavorite }: HistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const mealNames = entry.response.meals.map((m) => m.name).join(', ')
  const filterLabels = entry.filters.length > 0 ? entry.filters.join(', ') : null

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      {/* Compact header — always visible */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="cursor-pointer w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            {/* Ingredients */}
            <p className="text-sm font-medium text-stone-800 truncate">
              {truncate(entry.ingredients, 60)}
            </p>
            {/* Meal names preview */}
            <p className="text-xs text-stone-400 truncate">
              {truncate(mealNames, 70)}
            </p>
            {/* Filters */}
            {filterLabels && (
              <p className="text-xs text-amber-600">{filterLabels}</p>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="text-xs text-stone-400 whitespace-nowrap">
              {formatDate(entry.searchedAt)}
            </span>
            <span className="text-xs text-amber-600 font-medium">
              {isExpanded ? 'Hide ↑' : 'Show →'}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded: full meal cards */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="history-meals"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-stone-100 p-4 space-y-4 bg-stone-50">
              {entry.response.meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  user={user}
                  isFavorited={isFavorited(meal.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
