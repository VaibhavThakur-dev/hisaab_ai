'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categoryConfig } from '@/components/category-badge'
import type { Category } from '@/types'

const schema = z.object({
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount'),
  category: z.enum(['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'education', 'other'] as const),
  description: z.string().min(1, 'Required').max(100),
  date: z.string().min(1),
})
type FormValues = z.infer<typeof schema>

export default function AddExpensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      category: 'other',
    },
  })
  const category = watch('category')

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, amount: Number(data.amount) }),
    })
    if (!res.ok) {
      const json = await res.json() as { error: string }
      setError(json.error)
      setLoading(false)
      return
    }
    router.push('/expenses')
    router.refresh()
  }

  return (
    <div className="px-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            placeholder="0"
            className="text-2xl font-bold h-14"
            {...register('amount')}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={category} onValueChange={(v) => setValue('category', v as Category)}>
            <SelectTrigger className="h-12">
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
          <Input id="description" placeholder="What did you spend on?" className="h-12" {...register('description')} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" className="h-12" {...register('date')} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
          {loading ? 'Adding…' : 'Add Expense'}
        </Button>
      </form>
    </div>
  )
}
