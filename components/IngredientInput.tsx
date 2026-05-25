'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  ingredients: z
    .string()
    .min(3, 'Add at least a couple of ingredients')
    .max(500, 'That\'s a lot — try trimming it down a bit'),
})

type FormValues = z.infer<typeof formSchema>

const EXAMPLE_INPUT =
  'some leftover rotisserie chicken, half an onion, rice, frozen peas, soy sauce'

interface IngredientInputProps {
  onSubmit: (ingredients: string) => void
  isLoading: boolean
}

export function IngredientInput({ onSubmit, isLoading }: IngredientInputProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const value = watch('ingredients') ?? ''

  function handleFormSubmit(data: FormValues) {
    onSubmit(data.ingredients)
  }

  function fillExample() {
    setValue('ingredients', EXAMPLE_INPUT, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div className="relative">
        <Textarea
          {...register('ingredients')}
          placeholder="e.g. chicken thighs, half an onion, rice, whatever's in the back of your pantry..."
          className={cn(
            'min-h-[100px] resize-none text-base leading-relaxed',
            'focus-visible:ring-amber-500',
            errors.ingredients && 'border-red-500 focus-visible:ring-red-500'
          )}
          disabled={isLoading}
          aria-describedby={errors.ingredients ? 'ingredients-error' : undefined}
        />
        <span className="absolute bottom-2 right-3 text-xs text-stone-400">
          {value.length}/500
        </span>
      </div>

      {errors.ingredients && (
        <p id="ingredients-error" className="text-sm text-red-600" role="alert">
          {errors.ingredients.message}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:flex-1"
        >
          {isLoading ? 'Thinking about dinner...' : 'What can I make?'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={fillExample}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Try an example
        </Button>
      </div>
    </form>
  )
}
