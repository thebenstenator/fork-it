'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const KOFI_URL = 'https://ko-fi.com/benanderson5809'
const SESSION_KEY = 'forkit-kofi-dismissed'

interface KofiPromptProps {
  show: boolean
}

export function KofiPrompt({ show }: KofiPromptProps) {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash

  // Check sessionStorage after mount (client-only)
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(SESSION_KEY)
    if (!wasDismissed) setDismissed(false)
  }, [])

  function dismiss() {
    setDismissed(true)
    sessionStorage.setItem(SESSION_KEY, '1')
  }

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ delay: 0.6, duration: 0.3 }} // slight delay so it doesn't compete with cards
          className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500"
        >
          <span>
            Find this useful?{' '}
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              ☕ Buy me a coffee
            </a>
          </span>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-stone-300 hover:text-stone-500 transition-colors text-base leading-none"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
