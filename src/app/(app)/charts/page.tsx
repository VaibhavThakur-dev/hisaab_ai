'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryPieChart, MonthlyBarChart } from '@/components/spending-chart'
import CategoryBadge from '@/components/category-badge'
import useChartsStore from '@/stores/useChartsStore'
import type { Category } from '@/types'

interface DashboardApiData {
  totalSpent: number
  categoryTotals: Record<string, number>
}

const months = Array.from({ length: 6 }, (_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  return d.toISOString().slice(0, 7)
})

export default function ChartsPage() {
  const { categoryTotals, totalSpent, monthlyData, isLoading, month, setCategoryData, setMonthlyData, setLoading, setMonth } = useChartsStore()

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard?month=${month}`)
      .then((r) => r.json())
      .then((j: { data: DashboardApiData }) => {
        setCategoryData(j.data?.totalSpent ?? 0, j.data?.categoryTotals ?? {})
      })
      .finally(() => setLoading(false))
  }, [month, setCategoryData, setLoading])

  useEffect(() => {
    if (monthlyData.length > 0) return
    Promise.all(
      months.map((m) =>
        fetch(`/api/dashboard?month=${m}`)
          .then((r) => r.json())
          .then((j: { data: DashboardApiData }) => ({ month: m, amount: j.data?.totalSpent ?? 0 }))
      )
    ).then((results) => setMonthlyData(results.reverse()))
  }, [monthlyData.length, setMonthlyData])

  return (
    <div className="px-4 pt-6 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Charts</h1>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : Object.keys(categoryTotals).length > 0 ? (
        <>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={categoryTotals} />
              <div className="mt-3 space-y-2">
                {Object.entries(categoryTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <CategoryBadge category={cat as Category} size="sm" />
                      <span className="text-xs font-semibold text-foreground">
                        ₹{(amount / 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyBarChart data={monthlyData} />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex flex-col items-center py-16 gap-2">
          <p className="text-4xl">📊</p>
          <p className="text-sm text-muted-foreground">No data for this month</p>
        </div>
      )}
    </div>
  )
}
