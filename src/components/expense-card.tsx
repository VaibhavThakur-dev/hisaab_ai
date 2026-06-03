'use client'

import { useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import CategoryBadge from './category-badge'
import { Button } from '@/components/ui/button'
import type { Expense } from '@/types'

interface Props {
  expense: Expense
  onDelete?: (id: string) => void
  onEdit?: (expense: Expense) => void
}

export default function ExpenseCard({ expense, onDelete, onEdit }: Props) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    await onDelete(expense._id)
    setDeleting(false)
  }

  const date = new Date(expense.date)
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const amountStr = `₹${(expense.amount / 100).toLocaleString('en-IN')}`

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl shadow-sm border border-border">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <CategoryBadge category={expense.category} size="sm" />
          <span className="text-[10px] text-muted-foreground">{dateStr}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-semibold text-destructive">{amountStr}</span>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => onEdit(expense)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
