'use client'

import { useState, useEffect, useRef } from 'react'
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

function readPersistedFilters(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as string[]) : []
  } catch {
    return []
  }
}

export function FilterChips({ onChange }: FilterChipsProps) {
  // Lazy initializer reads localStorage once on mount — no effect needed for the state itself
  const [selected, setSelected] = useState<string[]>(readPersistedFilters)
  const posthog = usePostHog()

  // Notify parent of any persisted initial filters once after hydration.
  // We only call onChange here (not setSelected), so no cascading setState.
  const initialFilters = useRef(selected)
  useEffect(() => {
    if (initialFilters.current.length > 0) {
      onChange(initialFilters.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally once on mount

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

    posthog?.capture('filter_toggled', {
      filter: id,
      action: isCurrentlyActive ? 'removed' : 'added',
      active_filters: next,
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-400 uppercase tracking-wide font-medium text-center">
        Dietary needs
      </p>
      <div
        className="flex flex-wrap gap-2 justify-center"
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
                'cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700',
                isActive
                  ? 'border-red-300 bg-red-100 text-red-800'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
              )}
            >
              <span>{filter.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
