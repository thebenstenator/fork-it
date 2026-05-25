import { Redis } from '@upstash/redis'
import { type SuggestResponse } from './types'

const redis = Redis.fromEnv() // reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

const TTL_SECONDS = 60 * 60 * 24 // 24 hours

// ---------------------------------------------------------------------------
// Cache key: based on sorted normalized ingredients + sorted filters.
// Sorting ensures "chicken, rice" and "rice, chicken" hit the same cache key.
// ---------------------------------------------------------------------------

export function buildCacheKey(ingredients: string[], filters: string[]): string {
  const sortedIngredients = [...ingredients].sort().join(',')
  const sortedFilters = [...filters].sort().join(',')
  return `forkit:v1:${sortedIngredients}:${sortedFilters}`
}

export async function getCachedResponse(
  cacheKey: string
): Promise<SuggestResponse | null> {
  try {
    const cached = await redis.get<SuggestResponse>(cacheKey)
    return cached ?? null
  } catch {
    // Cache miss or Redis error — proceed without cache
    return null
  }
}

export async function setCachedResponse(
  cacheKey: string,
  response: SuggestResponse
): Promise<void> {
  try {
    await redis.set(cacheKey, response, { ex: TTL_SECONDS })
  } catch {
    // Cache write failure is non-fatal — log and continue
    console.error('[cache] Failed to write to Redis')
  }
}
