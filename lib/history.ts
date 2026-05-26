import { type SuggestResponse } from './types'

// ---------------------------------------------------------------------------
// Search history — stored in localStorage, capped at MAX_ENTRIES.
// No account required. Cleared only when the user explicitly asks.
// ---------------------------------------------------------------------------

export interface HistoryEntry {
  id: string
  ingredients: string      // raw input string the user typed
  filters: string[]        // active dietary filters at search time
  response: SuggestResponse
  searchedAt: string       // ISO 8601
}

const STORAGE_KEY = 'forkit:history'
const MAX_ENTRIES = 20

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export function pushHistory(
  entry: Omit<HistoryEntry, 'id' | 'searchedAt'>
): void {
  if (typeof window === 'undefined') return
  try {
    const history = getHistory()
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      searchedAt: new Date().toISOString(),
    }
    // Prepend newest, cap at max
    const updated = [newEntry, ...history].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Storage quota exceeded or unavailable — non-fatal
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // non-fatal
  }
}
