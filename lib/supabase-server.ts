import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Call this in Server Components, Route Handlers, and Server Actions.
// Reads/writes session cookies so auth persists across SSR requests.
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — cookies are read-only here.
            // The middleware handles refreshing the session cookie instead.
          }
        },
      },
    }
  )
}
