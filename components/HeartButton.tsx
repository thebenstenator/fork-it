'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { type Meal } from '@/lib/types'
import { type User } from '@supabase/supabase-js'
import { AuthModal } from './AuthModal'

interface HeartButtonProps {
  meal: Meal
  user: User | null
  isFavorited: boolean
  onToggle: (meal: Meal) => Promise<void>
}

export function HeartButton({ meal, user, isFavorited, onToggle }: HeartButtonProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation() // don't let the click bubble to the card expand toggle

    if (!user) {
      setShowAuthModal(true)
      return
    }

    await onToggle(meal)
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.85 }}
        aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
        title={isFavorited ? 'Saved!' : 'Save recipe'}
        className="cursor-pointer shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 rounded p-0.5"
      >
        <Heart
          size={18}
          className={isFavorited ? 'fill-red-700 stroke-red-700' : 'stroke-stone-300 hover:stroke-stone-400'}
        />
      </motion.button>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
