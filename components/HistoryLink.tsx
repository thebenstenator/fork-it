'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getHistory } from '@/lib/history'

// Renders " · Recent searches" only when the user has at least one saved search.
// The separator lives inside this component so the footer never has a dangling " · ".
// suppressHydrationWarning on the parent <p> handles the server/client localStorage mismatch.
export function HistoryLink() {
  const [hasHistory] = useState(() => {
    if (typeof window === 'undefined') return false
    return getHistory().length > 0
  })

  if (!hasHistory) return null

  return (
    <>
      {' · '}
      <Link href="/history" className="hover:text-stone-600 transition-colors">
        Recent searches
      </Link>
    </>
  )
}
