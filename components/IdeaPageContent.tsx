'use client'

import { motion } from 'framer-motion'
import { MealCard } from './MealCard'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useFavorites'
import type { Meal } from '@/lib/types'

interface IdeaPageContentProps {
  meals: Meal[]
}

export function IdeaPageContent({ meals }: IdeaPageContentProps) {
  const { user } = useAuth()
  const { toggleFavorite, isFavorited } = useFavorites(user)

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {meals.map((meal) => (
        <motion.div
          key={meal.id}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
          }}
        >
          <MealCard
            meal={meal}
            user={user}
            isFavorited={isFavorited(meal.id)}
            onToggleFavorite={toggleFavorite}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
