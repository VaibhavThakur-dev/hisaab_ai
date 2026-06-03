'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import ExpenseCard from '@/components/expense-card'
import AddExpenseSheet from '@/components/add-expense-sheet'
import { categoryConfig } from '@/components/category-badge'
import useExpenseStore from '@/stores/useExpenseStore'
import type { Category, Expense } from '@/types'

export default function ExpensesPage() {
  const { expenses, filters, setExpenses, removeExpense, setFilters, isLoading, setLoading } = useExpenseStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ month: filters.month })
    if (filters.category !== 'all') params.set('category', filters.category)
    const res = await fetch(`/api/expenses?${params}`)
    const json = await res.json() as { data: Expense[] }
    setExpenses(json.data ?? [])
    setLoading(false)
  }, [filters, setExpenses, setLoading])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const handleDelete = async (id: string) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    removeExpense(id)
  }

  const totalStr = `₹${(expenses.reduce((s, e) => s + e.amount, 0) / 100).toLocaleString('en-IN')}`

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">{totalStr} this period</p>
        </div>
        <Button size="sm" className="rounded-xl" onClick={() => setSheetOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="flex gap-2">
        <Select value={filters.month} onValueChange={(v) => setFilters({ month: v })}>
          <SelectTrigger className="flex-1 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(v) => setFilters({ category: v as Category | 'all' })}>
          <SelectTrigger className="flex-1 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(Object.keys(categoryConfig) as Category[]).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryConfig[cat].emoji} {categoryConfig[cat].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <p className="text-4xl">🧾</p>
          <p className="text-sm text-muted-foreground">No expenses found</p>
          <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)}>Add expense</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <ExpenseCard key={exp._id} expense={exp} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <AddExpenseSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={(exp) => { setExpenses([exp, ...expenses]) }}
      />
    </div>
  )
}
