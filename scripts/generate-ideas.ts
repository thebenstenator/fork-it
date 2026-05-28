/**
 * scripts/generate-ideas.ts
 *
 * Pre-generates meal content for all /ideas/[slug] pages and writes them to
 * data/ideas/<slug>.json so the Next.js build never calls Spoonacular or
 * Claude at deploy time.
 *
 * Usage:
 *   npm run generate:ideas
 *
 * After running, commit the data/ideas/ directory:
 *   git add data/ideas/ && git commit -m "data: regenerate ideas content"
 *
 * Re-run only when you add new slugs to lib/ideas.ts or want fresh content.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// ---------------------------------------------------------------------------
// Step 1: Load .env.local BEFORE importing any lib that reads process.env.
//
// lib/spoonacular.ts and lib/claude.ts read API keys at module initialisation
// time, so env vars must be in place before those modules are imported.
// Static imports are hoisted — dynamic import() inside main() runs after this.
// ---------------------------------------------------------------------------

const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes
    if ((val[0] === '"' && val.at(-1) === '"') || (val[0] === "'" && val.at(-1) === "'")) {
      val = val.slice(1, -1)
    }
    if (key && !process.env[key]) process.env[key] = val
  }
} else {
  console.warn('Warning: .env.local not found — API keys must already be in environment.')
}

// ---------------------------------------------------------------------------
// Step 2: Main — dynamic import so modules load after env vars are set
// ---------------------------------------------------------------------------

async function main() {
  // Dynamic import guarantees lib modules initialise after env is ready
  const { IDEAS, getIdeasMeals } = await import('../lib/ideas.js')

  const outDir = join(process.cwd(), 'data', 'ideas')
  mkdirSync(outDir, { recursive: true })

  console.log(`\nGenerating content for ${IDEAS.length} idea pages...\n`)

  let ok = 0
  let fail = 0

  // Sequential — avoid hammering Spoonacular / Claude simultaneously
  for (const idea of IDEAS) {
    process.stdout.write(`  ${idea.slug.padEnd(36)}`)
    try {
      const meals = await getIdeasMeals(idea)
      writeFileSync(
        join(outDir, `${idea.slug}.json`),
        JSON.stringify(meals, null, 2),
        'utf-8'
      )
      console.log(`✓  ${meals.length} meals`)
      ok++
    } catch (err) {
      console.log(`✗  ${err instanceof Error ? err.message : String(err)}`)
      fail++
    }
  }

  console.log(`\n${ok} succeeded, ${fail} failed`)
  console.log(`Output: data/ideas/\n`)

  if (ok > 0) {
    console.log('Next step — commit the generated files:')
    console.log('  git add data/ideas/ && git commit -m "data: regenerate ideas content"\n')
  }

  if (fail > 0) process.exit(1)
}

main().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
