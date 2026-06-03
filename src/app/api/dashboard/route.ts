import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ExpenseModel from '@/models/Expense'
import BudgetModel from '@/models/Budget'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)

    const [year, mon] = month.split('-').map(Number)
    const startDate = new Date(year, mon - 1, 1)
    const endDate = new Date(year, mon, 0, 23, 59, 59, 999)

    await connectDB()

    const [expenses, budget] = await Promise.all([
      ExpenseModel.find({
        userId: session.user.id,
        date: { $gte: startDate, $lte: endDate },
      }).lean(),
      BudgetModel.findOne({ userId: session.user.id, month }).lean(),
    ])

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

    const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount
      return acc
    }, {})

    const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]

    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    return NextResponse.json({
      data: {
        totalSpent,
        totalBudget: budget?.totalBudget ?? 0,
        remaining: (budget?.totalBudget ?? 0) - totalSpent,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
        categoryTotals,
        recentExpenses,
        month,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
