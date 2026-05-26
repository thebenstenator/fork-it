'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePostHog } from 'posthog-js/react'

export const FILTERS = [
  { id: 'vegetarian',  label: 'Vegetarian',    emoji: '🌿' },
  { id: 'dairy-free',  label: 'Dairy-Free',    emoji: '🥛' },
  { id: 'gluten-free', label: 'Gluten-Free',   emoji: '🌾' },
  { id: 'quick',       label: 'Quick (<20 min)', emoji: '⚡' },
  { id: 'kid-friendly',label: 'Kid-Friendly',  emoji: '👶' },
] as const

export type FilterId = (typeof FILTERS)[number]['id']

const STORAGE_KEY = 'forkit-filters'

interface FilterChipsProps {
  onChange: (filters: string[]) => void
}

export function FilterChips({ onChange }: FilterChipsProps) {
  const [selected, setSelected] = useState<string[]>([])
  const posthog = usePostHog()

  // Restore persisted filters on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: string[] = JSON.parse(stored)
        setSelected(parsed)
        onChange(parsed)
      }
    } catch {
      // Ignore parse errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle(id: string) {
    const isCurrentlyActive = selected.includes(id)
    const next = isCurrentlyActive
      ? selected.filter((f) => f !== id)
      : [...selected, id]

    setSelected(next)
    onChange(next)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Storage unavailable — non-fatal
    }

    // PostHog event tracking
    posthog?.capture('filter_toggled', {
      filter: id,
      action: isCurrentlyActive ? 'removed' : 'added',
      active_filters: next,
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">
        Dietary needs
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Dietary filters"
      >
        {FILTERS.map((filter) => {
          const isActive = selected.includes(filter.id)
          return (
            <motion.button
              key={filter.id}
              type="button"
              onClick={() => toggle(filter.id)}
              role="checkbox"
              aria-checked={isActive}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                isActive
                  ? 'border-amber-400 bg-amber-100 text-amber-700'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
              )}
            >
              <span aria-hidden="true">{filter.emoji}</span>
              <span>{filter.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
