'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getHistory } from '@/lib/history'

// Renders a "History" link only when the user has at least one saved search.
// Uses a lazy initializer so it reads localStorage once on mount with no effect.
export function HistoryLink() {
  const [hasHistory] = useState(() => {
    if (typeof window === 'undefined') return false
    return getHistory().length > 0
  })

  if (!hasHistory) return null

  return (
    <Link
      href="/history"
      className="hover:text-stone-600 transition-colors"
    >
      Recent searches
    </Link>
  )
}
