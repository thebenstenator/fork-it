import { type SuggestResponse } from '@/lib/types'
import { MealCard } from './MealCard'
import { MealCardSkeleton } from './MealCardSkeleton'

interface MealSuggestionsProps {
  data: SuggestResponse | null
  isLoading: boolean
  error: string | null
}

export function MealSuggestions({ data, isLoading, error }: MealSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-live="polite" aria-label="Loading meal suggestions">
        <p className="text-sm text-stone-500 text-center animate-pulse">
          Thinking about dinner...
        </p>
        {[1, 2, 3].map((i) => (
          <MealCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
        <p className="text-sm text-red-700">
          Hmm, something went wrong. {error}
        </p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4" aria-live="polite">
      {data.meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  )
}
