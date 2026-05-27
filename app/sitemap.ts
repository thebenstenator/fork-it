import type { MetadataRoute } from 'next'
import { IDEAS } from '@/lib/ideas'

const BASE = 'https://forkit.food'

export default function sitemap(): MetadataRoute.Sitemap {
  const ideaPages: MetadataRoute.Sitemap = IDEAS.map((idea) => ({
    url: `${BASE}/ideas/${idea.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE}/ideas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...ideaPages,
  ]
}
