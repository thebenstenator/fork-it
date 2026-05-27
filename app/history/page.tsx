'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HistoryCard } from '@/components/HistoryCard'
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/history'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useFavorites'

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory())
  const { user } = useAuth()
  const { toggleFavorite, isFavorited } = useFavorites(user)

  function handleClear() {
    clearHistory()
    setEntries([])
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-[680px] px-4 py-10 space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-amber-600 hover:text-amber-700 transition-colors mb-2 inline-block"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Recent searches
            </h1>
            <p className="text-stone-500 mt-1">
              Your last {entries.length === 1 ? 'search' : `${entries.length} searches`} — stored on this device only.
            </p>
          </div>

          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="cursor-pointer shrink-0 text-sm text-stone-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </header>

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🍴</p>
            <p className="text-stone-500">No searches yet.</p>
            <Link
              href="/"
              className="inline-block text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              Find something to make →
            </Link>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                }}
              >
                <HistoryCard
                  entry={entry}
                  user={user}
                  isFavorited={isFavorited}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer note */}
        {entries.length > 0 && (
          <p className="text-xs text-center text-stone-400 pt-4">
            History is saved locally on this device and never sent to our servers.
          </p>
        )}
      </div>
    </div>
  )
}
