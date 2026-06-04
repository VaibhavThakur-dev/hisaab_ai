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
import type { Budget, Category, CategoryLimits } from '@/types'

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

function budgetToFormValues(b: Budget): Partial<FormValues> {
  const vals: Partial<FormValues> = { totalBudget: String(b.totalBudget / 100) }
  CATEGORIES.forEach((cat) => {
    vals[cat] = b.categoryLimits?.[cat] ? String(b.categoryLimits[cat] / 100) : ''
  })
  return vals
}

export default function BudgetPage() {
  const { budget, setBudget, isLoading, setLoading } = useBudgetStore()
  const [spent, setSpent] = useState(0)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [lastMonthBudget, setLastMonthBudget] = useState<Budget | null>(null)

  const month = new Date().toISOString().slice(0, 7)
  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const lastMonthStr = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 7)
  })()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/budget?month=${month}`).then((r) => r.json()),
      fetch(`/api/dashboard?month=${month}`).then((r) => r.json()),
      fetch(`/api/budget?month=${lastMonthStr}`).then((r) => r.json()),
    ]).then(([bRes, dRes, lRes]) => {
      const b = (bRes as { data: Budget | null }).data
      const d = (dRes as { data: { totalSpent: number } }).data
      const l = (lRes as { data: Budget | null }).data

      setBudget(b)
      setSpent(d?.totalSpent ?? 0)

      if (b) {
        reset(budgetToFormValues(b) as FormValues)
        setIsEditing(false)
      } else {
        setIsEditing(true)
        if (l) {
          setLastMonthBudget(l)
        }
      }
    }).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copyLastMonth = () => {
    if (!lastMonthBudget) return
    reset(budgetToFormValues(lastMonthBudget) as FormValues)
    setLastMonthBudget(null)
  }

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
    const json = await res.json() as { data: Budget }
    setBudget(json.data)
    setSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="px-4 pt-6 pb-24 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Budget</h1>
        <p className="text-sm text-muted-foreground">{monthLabel}</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : budget && !isEditing ? (
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
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
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 rounded-xl"
              onClick={() => {
                reset(budgetToFormValues(budget) as FormValues)
                setIsEditing(true)
              }}
            >
              Edit Budget
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {(isEditing || !budget) && !isLoading && (
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {budget ? `Edit Budget — ${monthLabel}` : `Set Budget — ${monthLabel}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastMonthBudget && (
              <div className="mb-4 p-3 bg-muted rounded-xl flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Copy last month&apos;s budget?{' '}
                  <span className="font-semibold text-foreground">
                    ₹{(lastMonthBudget.totalBudget / 100).toLocaleString('en-IN')}
                  </span>
                </p>
                <Button size="sm" variant="secondary" className="shrink-0 h-7 text-xs" onClick={copyLastMonth}>
                  Copy
                </Button>
              </div>
            )}

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

              <div className="flex gap-2 pt-1">
                {budget && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex-1 h-11 font-semibold" disabled={saving}>
                  {saving ? 'Saving…' : budget ? 'Save Changes' : 'Set Budget'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
