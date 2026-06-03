'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { TrendingDown, Wallet, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import BudgetRing from '@/components/budget-ring'
import ExpenseCard from '@/components/expense-card'
import CategoryBadge from '@/components/category-badge'
import type { Expense, Category } from '@/types'

interface DashboardData {
  totalSpent: number
  totalBudget: number
  remaining: number
  topCategory: { name: string; amount: number } | null
  recentExpenses: Expense[]
  month: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const month = new Date().toISOString().slice(0, 7)
  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  useEffect(() => {
    fetch(`/api/dashboard?month=${month}`)
      .then((r) => r.json())
      .then((j: { data: DashboardData }) => setData(j.data))
      .finally(() => setLoading(false))
  }, [month])

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-4 pt-6 space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="text-2xl font-bold text-foreground">{firstName} 👋</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{monthLabel}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <>
          <Card className="rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">This month</p>
                  <p className="text-3xl font-bold text-foreground">
                    ₹{((data?.totalSpent ?? 0) / 100).toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data?.totalBudget
                      ? `₹${((data.remaining > 0 ? data.remaining : 0) / 100).toLocaleString('en-IN')} left`
                      : 'No budget set'}
                  </p>
                  {data?.topCategory && (
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-xs text-muted-foreground">Top spend:</span>
                      <CategoryBadge category={data.topCategory.name as Category} size="sm" />
                    </div>
                  )}
                </div>
                {data && (
                  <BudgetRing spent={data.totalSpent} budget={data.totalBudget} size={110} />
                )}
              </div>
            </CardContent>
          </Card>

          {!data?.totalBudget && (
            <Link href="/budget">
              <Card className="rounded-2xl border-dashed border-primary/40 bg-primary/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Set your budget</p>
                      <p className="text-xs text-muted-foreground">Track spending against a goal</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </CardContent>
              </Card>
            </Link>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Recent Expenses</h2>
              <Link href="/expenses" className="text-xs text-primary font-medium">
                See all
              </Link>
            </div>

            {data?.recentExpenses.length === 0 ? (
              <Card className="rounded-2xl border-dashed">
                <CardContent className="flex flex-col items-center py-8 gap-2">
                  <p className="text-sm text-muted-foreground">No expenses yet</p>
                  <Link href="/expenses/add" className="text-xs text-primary font-semibold">
                    Add your first expense →
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {data?.recentExpenses.map((exp) => (
                  <ExpenseCard key={exp._id} expense={exp} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
