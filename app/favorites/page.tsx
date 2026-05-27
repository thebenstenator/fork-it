'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useFavorites'
import { MealCard } from '@/components/MealCard'
import { AuthModal } from '@/components/AuthModal'
import { useState } from 'react'

export default function FavoritesPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { favorites, loading: favLoading, toggleFavorite, isFavorited } = useFavorites(user)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const loading = authLoading || favLoading

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-[680px] px-4 py-10 space-y-8">

        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-amber-600 hover:text-amber-700 transition-colors mb-2 inline-block"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Saved recipes
            </h1>
          </div>

          {user && (
            <button
              onClick={signOut}
              className="cursor-pointer shrink-0 mt-8 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Sign out
            </button>
          )}
        </header>

        {/* Not signed in */}
        {!authLoading && !user && (
          <div className="text-center py-16 space-y-4">
            <p className="text-4xl">♡</p>
            <p className="text-stone-700 font-medium">Sign in to see your saved recipes</p>
            <p className="text-sm text-stone-400">
              Tap ♡ on any recipe to save it. No password needed — just your email.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="cursor-pointer inline-block rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              Sign in with email →
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-sm text-stone-400">Loading…</p>
          </div>
        )}

        {/* Signed in — empty state */}
        {!loading && user && favorites.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🍴</p>
            <p className="text-stone-500">No saved recipes yet.</p>
            <Link
              href="/"
              className="inline-block text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              Find something to make →
            </Link>
          </div>
        )}

        {/* Favorites list */}
        {!loading && user && favorites.length > 0 && (
          <>
            <p className="text-sm text-stone-400">
              {favorites.length} saved {favorites.length === 1 ? 'recipe' : 'recipes'}
            </p>
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
            >
              {favorites.map((fav) => (
                <motion.div
                  key={fav.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  }}
                >
                  <MealCard
                    meal={fav.meal_data}
                    user={user}
                    isFavorited={isFavorited(fav.meal_id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    </div>
  )
}
