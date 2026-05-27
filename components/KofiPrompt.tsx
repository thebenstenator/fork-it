'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const KOFI_URL = 'https://ko-fi.com/benanderson5809'
const SESSION_KEY = 'forkit-kofi-dismissed'

interface KofiPromptProps {
  show: boolean
}

function readDismissed(): boolean {
  if (typeof window === 'undefined') return true // hidden during SSR to avoid flash
  return Boolean(sessionStorage.getItem(SESSION_KEY))
}

export function KofiPrompt({ show }: KofiPromptProps) {
  // Lazy initializer reads sessionStorage once on mount — no effect needed
  const [dismissed, setDismissed] = useState<boolean>(readDismissed)

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
              className="text-red-800 hover:text-red-900 font-medium transition-colors"
            >
              ☕ Buy me a coffee
            </a>
          </span>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="cursor-pointer text-stone-300 hover:text-stone-500 transition-colors text-base leading-none"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
