import type { Metadata } from 'next'
import Link from 'next/link'
import { IDEAS } from '@/lib/ideas'

export const metadata: Metadata = {
  title: 'Dinner idea starters — fork it.',
  description: 'Browse ingredient combination ideas. Find dinner recipes for chicken and rice, beef and pasta, and dozens more.',
  alternates: {
    canonical: 'https://forkit.food/ideas',
  },
}

export default function IdeasPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-[680px] px-4 py-10 space-y-8">

        {/* Header */}
        <header className="space-y-2">
          <Link
            href="/"
            className="text-sm text-red-800 hover:text-red-900 transition-colors inline-block"
          >
            ← Back to search
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Dinner idea starters
          </h1>
          <p className="text-stone-500">
            Not sure what to search? Start with one of these common ingredient combinations.
          </p>
        </header>

        {/* Idea grid */}
        <div className="grid gap-2">
          {IDEAS.map((idea) => (
            <Link
              key={idea.slug}
              href={`/ideas/${idea.slug}`}
              className="group flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3 hover:border-red-200 hover:shadow-sm transition-all"
            >
              <div className="min-w-0">
                <p className="font-medium text-stone-800 group-hover:text-red-800 transition-colors truncate">
                  {idea.h1.replace('Dinner ideas with ', '')}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {idea.ingredients.join(' · ')}
                </p>
              </div>
              <span className="shrink-0 text-stone-300 group-hover:text-red-800 transition-colors">
                →
              </span>
            </Link>
          ))}
        </div>

        {/* CTA back to full search */}
        <div className="pt-2 border-t border-stone-200">
          <p className="text-sm text-stone-500">
            Have something specific?{' '}
            <Link href="/" className="font-medium text-red-800 hover:text-red-900 transition-colors">
              Search by your actual ingredients →
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
