'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import BudgetRing from '@/components/budget-ring'
import { categoryConfig } from '@/components/category-badge'
import useBudgetStore from '@/stores/useBudgetStore'
import type { Category, CategoryLimits } from '@/types'

const schema = z.object({
  totalBudget: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount'),
  food: z.string().optional(),
  transport: z.string().optional(),
  shopping: z.string().optional(),
  bills: z.string().optional(),
  entertainment: z.string().optional(),
  health: z.string().optional(),
  education: z.string().optional(),
  other: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const CATEGORIES = Object.keys(categoryConfig) as Category[]

export default function BudgetPage() {
  const { budget, setBudget, isLoading, setLoading } = useBudgetStore()
  const [spent, setSpent] = useState(0)
  const [saving, setSaving] = useState(false)
  const month = new Date().toISOString().slice(0, 7)
  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/budget?month=${month}`).then((r) => r.json()),
      fetch(`/api/dashboard?month=${month}`).then((r) => r.json()),
    ]).then(([bRes, dRes]) => {
      const b = (bRes as { data: typeof budget }).data
      const d = (dRes as { data: { totalSpent: number } }).data
      setBudget(b)
      setSpent(d?.totalSpent ?? 0)
      if (b) {
        const vals: Partial<FormValues> = { totalBudget: String(b.totalBudget / 100) }
        CATEGORIES.forEach((cat) => {
          vals[cat] = b.categoryLimits?.[cat] ? String(b.categoryLimits[cat] / 100) : ''
        })
        reset(vals as FormValues)
      }
    }).finally(() => setLoading(false))
  }, [month, setBudget, setLoading, reset])

  const onSubmit = async (data: FormValues) => {
    setSaving(true)
    const categoryLimits = Object.fromEntries(
      CATEGORIES.map((cat) => [cat, data[cat] ? Number(data[cat]) : 0])
    ) as unknown as CategoryLimits

    const res = await fetch('/api/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, totalBudget: Number(data.totalBudget), categoryLimits }),
    })
    const json = await res.json() as { data: typeof budget }
    setBudget(json.data)
    setSaving(false)
  }

  return (
    <div className="px-4 pt-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Budget</h1>
        <p className="text-sm text-muted-foreground">{monthLabel}</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : budget ? (
        <Card className="rounded-2xl">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total budget</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ₹{(budget.totalBudget / 100).toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-muted-foreground">
                ₹{(spent / 100).toLocaleString('en-IN')} spent
              </p>
            </div>
            <BudgetRing spent={spent} budget={budget.totalBudget} size={100} />
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {budget ? 'Update Budget' : 'Set Budget'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="totalBudget">Total monthly budget (₹)</Label>
              <Input
                id="totalBudget"
                type="number"
                inputMode="decimal"
                placeholder="e.g. 30000"
                className="h-12 text-lg font-semibold"
                {...register('totalBudget')}
              />
              {errors.totalBudget && <p className="text-xs text-destructive">{errors.totalBudget.message}</p>}
            </div>

            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide pt-1">
              Category limits (optional)
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="space-y-1">
                  <Label htmlFor={cat} className="text-xs">
                    {categoryConfig[cat].emoji} {categoryConfig[cat].label}
                  </Label>
                  <Input
                    id={cat}
                    type="number"
                    inputMode="decimal"
                    placeholder="₹ limit"
                    className="h-9 text-sm"
                    {...register(cat as keyof FormValues)}
                  />
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={saving}>
              {saving ? 'Saving…' : budget ? 'Update Budget' : 'Set Budget'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
