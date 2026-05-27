'use client'

import { useState, useEffect, useCallback } from 'react'
import { type User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { type Meal } from '@/lib/types'

export interface FavoriteRow {
  id: string
  meal_id: string
  meal_name: string
  meal_data: Meal
  saved_at: string
}

interface UseFavoritesReturn {
  favorites: FavoriteRow[]
  loading: boolean
  toggleFavorite: (meal: Meal) => Promise<void>
  isFavorited: (mealId: string) => boolean
}

export function useFavorites(user: User | null): UseFavoritesReturn {
  const [storedFavorites, setStoredFavorites] = useState<FavoriteRow[]>([])
  // Tracks which user's favorites are in storedFavorites (null = not yet fetched)
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return // no setState here — favorites and loading derive from user + loadedForUserId

    const userId = user.id
    const supabase = createClient()

    supabase
      .from('favorites')
      .select('*')
      .order('saved_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setStoredFavorites(data as FavoriteRow[])
        }
        // Always mark the fetch as attempted so loading clears on error too
        setLoadedForUserId(userId)
      })
  }, [user])

  // Derive visible favorites — [] when no user or while the current user's fetch is in flight
  const favorites = user && loadedForUserId === user.id ? storedFavorites : []

  // Derive loading — true only while a signed-in user's fetch hasn't returned yet
  const loading = Boolean(user && loadedForUserId !== user.id)

  const favoritedIds = new Set(favorites.map((f) => f.meal_id))

  const isFavorited = useCallback(
    (mealId: string) => favoritedIds.has(mealId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favorites]
  )

  const toggleFavorite = useCallback(
    async (meal: Meal) => {
      if (!user) return
      const supabase = createClient()

      if (favoritedIds.has(meal.id)) {
        // Optimistic remove
        setStoredFavorites((prev) => prev.filter((f) => f.meal_id !== meal.id))
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('meal_id', meal.id)
      } else {
        // Optimistic add
        const newRow: FavoriteRow = {
          id: crypto.randomUUID(),
          meal_id: meal.id,
          meal_name: meal.name,
          meal_data: meal,
          saved_at: new Date().toISOString(),
        }
        setStoredFavorites((prev) => [newRow, ...prev])
        await supabase.from('favorites').insert({
          user_id: user.id,
          meal_id: meal.id,
          meal_name: meal.name,
          meal_data: meal,
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, favorites]
  )

  return { favorites, loading, toggleFavorite, isFavorited }
}
