import { searchRecipes } from './spoonacular'
import { enrichRecipes, generateFallbackRecipes } from './claude'
import type { Meal } from './types'

// ---------------------------------------------------------------------------
// Keyword definitions — each slug maps to a clean ingredient combination.
// These are the SEO landing pages for /ideas/[slug].
// ---------------------------------------------------------------------------

export interface IdeaDef {
  slug: string
  ingredients: string[]   // clean ingredient names for Spoonacular
  h1: string              // "Dinner ideas with chicken and rice"
  description: string     // SEO meta description (≤ 155 chars)
  relatedSlugs: string[]  // internal link targets — 2-3 related combos
}

export const IDEAS: IdeaDef[] = [
  {
    slug: 'chicken-rice',
    ingredients: ['chicken', 'rice'],
    h1: 'Dinner ideas with chicken and rice',
    description: 'Got chicken and rice in the fridge? Here are 3 easy weeknight dinners — from fried rice to one-pan casseroles.',
    relatedSlugs: ['chicken-broccoli', 'ground-beef-rice', 'black-beans-rice'],
  },
  {
    slug: 'ground-beef-pasta',
    ingredients: ['ground beef', 'pasta'],
    h1: 'Dinner ideas with ground beef and pasta',
    description: 'Ground beef and pasta is one of the most satisfying weeknight combos. Here are 3 easy dinners to make tonight.',
    relatedSlugs: ['pasta-chicken-cream', 'pasta-tomatoes-basil', 'canned-tuna-pasta'],
  },
  {
    slug: 'chicken-thighs-potatoes',
    ingredients: ['chicken thighs', 'potatoes'],
    h1: 'Dinner ideas with chicken thighs and potatoes',
    description: 'Chicken thighs and potatoes are built for easy weeknight dinners. Here are 3 practical meals to make tonight.',
    relatedSlugs: ['chicken-rice', 'chicken-bell-peppers-onion', 'chicken-mushrooms'],
  },
  {
    slug: 'eggs-cheese',
    ingredients: ['eggs', 'cheese'],
    h1: 'Dinner ideas with eggs and cheese',
    description: 'Eggs and cheese can do a lot more than breakfast. Here are 3 quick dinner ideas ready in 30 minutes or less.',
    relatedSlugs: ['pasta-tomatoes-basil', 'canned-tuna-pasta', 'chicken-spinach-garlic'],
  },
  {
    slug: 'salmon-broccoli',
    ingredients: ['salmon', 'broccoli'],
    h1: 'Dinner ideas with salmon and broccoli',
    description: 'Salmon and broccoli is a healthy weeknight pairing that comes together fast. Here are 3 ways to cook them tonight.',
    relatedSlugs: ['salmon-lemon-dill', 'steak-asparagus', 'tofu-broccoli'],
  },
  {
    slug: 'chicken-spinach-garlic',
    ingredients: ['chicken', 'spinach', 'garlic'],
    h1: 'Dinner ideas with chicken, spinach and garlic',
    description: 'Chicken, spinach, and garlic are a classic trio. Here are 3 easy meals you can put together in 30 minutes.',
    relatedSlugs: ['chickpeas-spinach', 'chicken-mushrooms', 'pasta-chicken-cream'],
  },
  {
    slug: 'shrimp-garlic-butter',
    ingredients: ['shrimp', 'garlic', 'butter'],
    h1: 'Dinner ideas with shrimp, garlic and butter',
    description: 'Shrimp, garlic, and butter cook up in 15 minutes flat. Here are 3 quick weeknight dinners.',
    relatedSlugs: ['shrimp-rice', 'salmon-lemon-dill', 'pasta-chicken-cream'],
  },
  {
    slug: 'lentils-tomatoes',
    ingredients: ['lentils', 'tomatoes'],
    h1: 'Dinner ideas with lentils and tomatoes',
    description: 'Lentils and tomatoes make a hearty, budget-friendly base. Here are 3 satisfying plant-based dinners tonight.',
    relatedSlugs: ['chickpeas-spinach', 'black-beans-rice', 'sweet-potato-black-beans'],
  },
  {
    slug: 'pasta-chicken-cream',
    ingredients: ['pasta', 'chicken', 'cream'],
    h1: 'Dinner ideas with pasta, chicken and cream',
    description: 'Pasta, chicken, and cream is the foundation of a dozen crowd-pleasers. Here are 3 easy versions for tonight.',
    relatedSlugs: ['ground-beef-pasta', 'pasta-tomatoes-basil', 'chicken-mushrooms'],
  },
  {
    slug: 'canned-tuna-pasta',
    ingredients: ['canned tuna', 'pasta'],
    h1: 'Dinner ideas with canned tuna and pasta',
    description: 'Canned tuna and pasta is a pantry-staple classic. Here are 3 quick dinners you can make without a grocery run.',
    relatedSlugs: ['ground-beef-pasta', 'pasta-tomatoes-basil', 'eggs-cheese'],
  },
  {
    slug: 'ground-beef-rice',
    ingredients: ['ground beef', 'rice'],
    h1: 'Dinner ideas with ground beef and rice',
    description: 'Ground beef and rice is a go-to combo for fast, filling weeknight meals. Here are 3 dinners to try tonight.',
    relatedSlugs: ['chicken-rice', 'black-beans-rice', 'ground-beef-pasta'],
  },
  {
    slug: 'black-beans-rice',
    ingredients: ['black beans', 'rice'],
    h1: 'Dinner ideas with black beans and rice',
    description: 'Black beans and rice are cheap, filling, and full of flavor. Here are 3 plant-based dinners ready in 30 minutes.',
    relatedSlugs: ['lentils-tomatoes', 'sweet-potato-black-beans', 'chickpeas-spinach'],
  },
  {
    slug: 'chicken-bell-peppers-onion',
    ingredients: ['chicken', 'bell peppers', 'onion'],
    h1: 'Dinner ideas with chicken, bell peppers and onion',
    description: 'Chicken, bell peppers, and onion go in everything from fajitas to stir-fries. Here are 3 dinners to make tonight.',
    relatedSlugs: ['chicken-rice', 'chicken-mushrooms', 'ground-beef-rice'],
  },
  {
    slug: 'pork-chops-apples',
    ingredients: ['pork chops', 'apples'],
    h1: 'Dinner ideas with pork chops and apples',
    description: 'Pork and apples are a classic pairing. Here are 3 hearty dinners that come together in under 40 minutes.',
    relatedSlugs: ['steak-asparagus', 'chicken-thighs-potatoes', 'chicken-mushrooms'],
  },
  {
    slug: 'tofu-broccoli',
    ingredients: ['tofu', 'broccoli'],
    h1: 'Dinner ideas with tofu and broccoli',
    description: 'Tofu and broccoli are a versatile plant-based pairing. Here are 3 satisfying dinners ready in under 30 minutes.',
    relatedSlugs: ['chickpeas-spinach', 'salmon-broccoli', 'lentils-tomatoes'],
  },
  {
    slug: 'chickpeas-spinach',
    ingredients: ['chickpeas', 'spinach'],
    h1: 'Dinner ideas with chickpeas and spinach',
    description: 'Chickpeas and spinach make quick, hearty plant-based meals. Here are 3 easy dinners to try tonight.',
    relatedSlugs: ['lentils-tomatoes', 'black-beans-rice', 'tofu-broccoli'],
  },
  {
    slug: 'pasta-tomatoes-basil',
    ingredients: ['pasta', 'tomatoes', 'basil'],
    h1: 'Dinner ideas with pasta, tomatoes and basil',
    description: 'Pasta, tomatoes, and basil: simple, classic, always good. Here are 3 dinners ready in 30 minutes.',
    relatedSlugs: ['ground-beef-pasta', 'canned-tuna-pasta', 'pasta-chicken-cream'],
  },
  {
    slug: 'chicken-mushrooms',
    ingredients: ['chicken', 'mushrooms'],
    h1: 'Dinner ideas with chicken and mushrooms',
    description: 'Chicken and mushrooms are a rich, savory combination. Here are 3 weeknight dinners ready in 30 minutes.',
    relatedSlugs: ['pasta-chicken-cream', 'chicken-spinach-garlic', 'chicken-thighs-potatoes'],
  },
  {
    slug: 'steak-asparagus',
    ingredients: ['steak', 'asparagus'],
    h1: 'Dinner ideas with steak and asparagus',
    description: 'Steak and asparagus feels special but comes together fast. Here are 3 weeknight-friendly dinners for tonight.',
    relatedSlugs: ['salmon-broccoli', 'pork-chops-apples', 'chicken-thighs-potatoes'],
  },
  {
    slug: 'salmon-lemon-dill',
    ingredients: ['salmon', 'lemon', 'dill'],
    h1: 'Dinner ideas with salmon, lemon and dill',
    description: 'Salmon, lemon, and dill is a bright, fresh combination. Here are 3 easy weeknight dinners ready in 20 minutes.',
    relatedSlugs: ['salmon-broccoli', 'shrimp-garlic-butter', 'steak-asparagus'],
  },
  {
    slug: 'sweet-potato-black-beans',
    ingredients: ['sweet potato', 'black beans'],
    h1: 'Dinner ideas with sweet potato and black beans',
    description: 'Sweet potato and black beans are a hearty, warming combo. Here are 3 easy plant-based dinners for tonight.',
    relatedSlugs: ['black-beans-rice', 'chickpeas-spinach', 'lentils-tomatoes'],
  },
  {
    slug: 'chicken-avocado',
    ingredients: ['chicken', 'avocado'],
    h1: 'Dinner ideas with chicken and avocado',
    description: 'Chicken and avocado make for fresh, satisfying dinners. Here are 3 easy meals ready in 30 minutes.',
    relatedSlugs: ['chicken-rice', 'chicken-spinach-garlic', 'chicken-bell-peppers-onion'],
  },
  {
    slug: 'ground-turkey-zucchini',
    ingredients: ['ground turkey', 'zucchini'],
    h1: 'Dinner ideas with ground turkey and zucchini',
    description: 'Ground turkey and zucchini make quick, healthy weeknight dinners. Here are 3 easy meals to try tonight.',
    relatedSlugs: ['ground-beef-pasta', 'ground-beef-rice', 'tofu-broccoli'],
  },
  {
    slug: 'shrimp-rice',
    ingredients: ['shrimp', 'rice'],
    h1: 'Dinner ideas with shrimp and rice',
    description: 'Shrimp and rice is a quick, satisfying weeknight combo. Here are 3 easy dinners you can make in 30 minutes.',
    relatedSlugs: ['shrimp-garlic-butter', 'chicken-rice', 'black-beans-rice'],
  },
  {
    slug: 'chicken-broccoli',
    ingredients: ['chicken', 'broccoli'],
    h1: 'Dinner ideas with chicken and broccoli',
    description: 'Chicken and broccoli are a reliable weeknight staple. Here are 3 practical meals ready in 30 minutes.',
    relatedSlugs: ['chicken-rice', 'salmon-broccoli', 'tofu-broccoli'],
  },
]

// ---------------------------------------------------------------------------
// Build-time meal fetcher — called once per slug during `next build`
// Falls back to Claude generation if Spoonacular returns fewer than 3 results.
// ---------------------------------------------------------------------------

const GOOD_MATCH_THRESHOLD = 3

export async function getIdeasMeals(idea: IdeaDef): Promise<Meal[]> {
  let spoonacularRecipes: Awaited<ReturnType<typeof searchRecipes>>['recipes'] = []

  try {
    const result = await searchRecipes(idea.ingredients, [])
    spoonacularRecipes = result.recipes
  } catch (err) {
    console.error(`[ideas] Spoonacular failed for ${idea.slug}:`, err)
  }

  try {
    if (spoonacularRecipes.length >= GOOD_MATCH_THRESHOLD) {
      const enrichment = await enrichRecipes(idea.ingredients, spoonacularRecipes, [])
      return enrichment.meals.map((meal, i) => {
        const spoon = spoonacularRecipes[i]
        return {
          ...meal,
          imageUrl: spoon?.image ?? null,
          matchScore: spoon
            ? { have: spoon.usedIngredientCount, total: spoon.usedIngredientCount + spoon.missedIngredientCount }
            : null,
          missingIngredients: spoon?.missedIngredients.map((m) => m.name) ?? [],
          showMealKitOffer: false,
          mealKitUrl: null,
          affiliateToolLink: null,
          affiliateIngredientLinks: [],
        }
      })
    }

    // Partial match — enrich whatever we have and generate the rest
    const needed = 3 - spoonacularRecipes.length
    const [enrichedExisting, generated] = await Promise.all([
      spoonacularRecipes.length > 0
        ? enrichRecipes(idea.ingredients, spoonacularRecipes, [])
        : Promise.resolve({ meals: [] }),
      generateFallbackRecipes(idea.ingredients, [], needed),
    ])

    const existingMeals: Meal[] = enrichedExisting.meals.map((meal, i) => {
      const spoon = spoonacularRecipes[i]
      return {
        ...meal,
        imageUrl: spoon?.image ?? null,
        matchScore: spoon
          ? { have: spoon.usedIngredientCount, total: spoon.usedIngredientCount + spoon.missedIngredientCount }
          : null,
        missingIngredients: spoon?.missedIngredients.map((m) => m.name) ?? [],
        showMealKitOffer: false,
        mealKitUrl: null,
        affiliateToolLink: null,
        affiliateIngredientLinks: [],
      }
    })

    const generatedMeals: Meal[] = generated.meals.map((meal) => ({
      ...meal,
      imageUrl: null,
      matchScore: null,
      missingIngredients: meal.missingIngredientNames ?? [],
      showMealKitOffer: false,
      mealKitUrl: null,
      affiliateToolLink: null,
      affiliateIngredientLinks: [],
    }))

    return [...existingMeals, ...generatedMeals].slice(0, 3)
  } catch (err) {
    console.error(`[ideas] Enrichment failed for ${idea.slug}:`, err)
    // Last resort: pure Claude fallback
    const fallback = await generateFallbackRecipes(idea.ingredients, [], 3)
    return fallback.meals.map((meal) => ({
      ...meal,
      imageUrl: null,
      matchScore: null,
      missingIngredients: meal.missingIngredientNames ?? [],
      showMealKitOffer: false,
      mealKitUrl: null,
      affiliateToolLink: null,
      affiliateIngredientLinks: [],
    }))
  }
}
