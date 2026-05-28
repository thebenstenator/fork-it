import { notFound } from 'next/navigation'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { IDEAS } from '@/lib/ideas'
import { IdeaPageContent } from '@/components/IdeaPageContent'
import type { Meal } from '@/lib/types'

// Only render slugs defined in IDEAS — anything else is a 404
export const dynamicParams = false

export async function generateStaticParams() {
  return IDEAS.map((idea) => ({ slug: idea.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const idea = IDEAS.find((i) => i.slug === slug)
  if (!idea) return {}

  return {
    title: `${idea.h1} — fork it.`,
    description: idea.description,
    alternates: {
      canonical: `https://forkit.food/ideas/${slug}`,
    },
    openGraph: {
      title: idea.h1,
      description: idea.description,
      url: `https://forkit.food/ideas/${slug}`,
      siteName: 'fork it.',
      type: 'website',
    },
  }
}

function loadMeals(slug: string): Meal[] {
  const filePath = join(process.cwd(), 'data', 'ideas', `${slug}.json`)
  if (!existsSync(filePath)) {
    throw new Error(
      `Missing pre-generated data for "${slug}". Run: npm run generate:ideas`
    )
  }
  return JSON.parse(readFileSync(filePath, 'utf-8')) as Meal[]
}

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const idea = IDEAS.find((i) => i.slug === slug)
  if (!idea) notFound()

  const meals = loadMeals(slug)
  const relatedIdeas = IDEAS.filter((i) => idea.relatedSlugs.includes(i.slug))

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-[680px] px-4 py-10 space-y-8">

        {/* Header */}
        <header className="space-y-2">
          <Link
            href="/ideas"
            className="text-sm text-red-800 hover:text-red-900 transition-colors inline-block"
          >
            ← All ideas
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            {idea.h1}
          </h1>
          <p className="text-stone-500 text-sm">
            {idea.description}
          </p>
        </header>

        {/* Meal cards — client component handles auth + favorites */}
        <IdeaPageContent meals={meals} />

        {/* Related ideas */}
        {relatedIdeas.length > 0 && (
          <section className="space-y-3 pt-2">
            <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wider">
              Related combinations
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedIdeas.map((related) => (
                <Link
                  key={related.slug}
                  href={`/ideas/${related.slug}`}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-red-200 hover:text-red-800 transition-colors"
                >
                  {related.ingredients.join(' + ')}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA — back to the live search */}
        <div className="border-t border-stone-200 pt-6">
          <p className="text-sm text-stone-500">
            Have different ingredients?{' '}
            <Link href="/" className="font-medium text-red-800 hover:text-red-900 transition-colors">
              Try the ingredient finder →
            </Link>
          </p>
        </div>

        {/* Spoonacular attribution */}
        <footer className="text-xs text-stone-400 text-center">
          Recipes via{' '}
          <a
            href="https://spoonacular.com"
            className="hover:text-stone-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Spoonacular
          </a>
          {' · '}
          This page may contain affiliate links.
        </footer>

      </div>
    </div>
  )
}
