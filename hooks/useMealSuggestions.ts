import { useState } from 'react'
import { type SuggestResponse } from '@/lib/types'

interface UseMealSuggestionsReturn {
  data: SuggestResponse | null
  isLoading: boolean
  error: string | null
  fetchSuggestions: (ingredients: string, filters: string[]) => Promise<void>
  reset: () => void
}

export function useMealSuggestions(): UseMealSuggestionsReturn {
  const [data, setData] = useState<SuggestResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchSuggestions(ingredients: string, filters: string[]) {
    setIsLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, filters }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      setData(json as SuggestResponse)
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function reset() {
    setData(null)
    setError(null)
    setIsLoading(false)
  }

  return { data, isLoading, error, fetchSuggestions, reset }
}
