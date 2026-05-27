import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// Handles the magic link redirect from Supabase.
// Supabase sends the user here with a `code` query param after they click the email link.
// We exchange the code for a session, set the cookie, then redirect home.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect home with an error flag the UI can surface
  return NextResponse.redirect(`${origin}/?auth_error=1`)
}
