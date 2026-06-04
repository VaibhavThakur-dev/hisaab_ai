'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categoryConfig } from './category-badge'
import type { Category, Expense } from '@/types'

const schema = z.object({
  amount: z.string().min(1).refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount'),
  category: z.enum(['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'education', 'other'] as const),
  description: z.string().min(1, 'Description is required').max(100),
  date: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (expense: Expense) => void
  onEdit?: (expense: Expense) => void
  initialExpense?: Expense
}

export default function AddExpenseSheet({ open, onClose, onAdd, onEdit, initialExpense }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialExpense

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      category: 'other',
    },
  })

  useEffect(() => {
    if (initialExpense) {
      setValue('amount', String(initialExpense.amount / 100))
      setValue('category', initialExpense.category)
      setValue('description', initialExpense.description)
      setValue('date', new Date(initialExpense.date).toISOString().slice(0, 10))
    } else {
      reset({
        date: new Date().toISOString().slice(0, 10),
        category: 'other',
        amount: '',
        description: '',
      })
    }
  }, [initialExpense, open, setValue, reset])

  const category = watch('category')

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)
    try {
      if (isEditing) {
        const res = await fetch(`/api/expenses/${initialExpense._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(data.amount),
            category: data.category,
            description: data.description,
            date: data.date,
          }),
        })
        const json = await res.json() as { data?: Expense; error?: string }
        if (!res.ok) throw new Error(json.error ?? 'Failed')
        onEdit?.(json.data!)
      } else {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(data.amount),
            category: data.category,
            description: data.description,
            date: data.date,
          }),
        })
        const json = await res.json() as { data?: Expense; error?: string }
        if (!res.ok) throw new Error(json.error ?? 'Failed')
        onAdd(json.data!)
        reset()
      }
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-8">
        <SheetHeader className="mb-5">
          <SheetTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              className="text-lg font-semibold"
              {...register('amount')}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setValue('category', v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(categoryConfig) as Category[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryConfig[cat].emoji} {categoryConfig[cat].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What did you spend on?"
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register('date')} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
            {loading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Expense')}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
