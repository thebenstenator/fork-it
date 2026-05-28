'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('sending')
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  function handleClose() {
    setEmail('')
    setStatus('idle')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-sm bg-white rounded-2xl shadow-xl p-6"
          >
            {status === 'sent' ? (
              <div className="text-center space-y-3 py-2">
                <p className="text-3xl">📬</p>
                <h2 className="text-lg font-bold text-stone-900">Check your email</h2>
                <p className="text-sm text-stone-500">
                  We sent a sign-in link to <strong>{email}</strong>.
                  Click it, then tap ♡ again to save your recipe.
                </p>
                <p className="text-xs text-stone-400">
                  The email comes from Supabase (our auth provider) — check spam if you don&apos;t see it.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-2 text-sm text-red-800 hover:text-red-900 font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Save this recipe</h2>
                  <p className="text-sm text-stone-500 mt-1">
                    Enter your email and we&apos;ll send a sign-in link — no password needed.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />

                  {status === 'error' && (
                    <p className="text-xs text-red-700">
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="cursor-pointer w-full rounded-lg bg-red-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-900 disabled:opacity-60 transition-colors"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send sign-in link →'}
                  </button>
                </form>

                <button
                  onClick={handleClose}
                  className="cursor-pointer w-full text-xs text-stone-400 hover:text-stone-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
