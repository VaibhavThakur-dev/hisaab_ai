import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ExpenseModel from '@/models/Expense'
import BudgetModel from '@/models/Budget'
import AiTipModel from '@/models/AiTip'
import { generateTips } from '@/lib/openrouter'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { month?: string }
    const month = body.month ?? new Date().toISOString().slice(0, 7)

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

    if (expenses.length === 0) {
      return NextResponse.json({ error: 'No expenses found for this month' }, { status: 400 })
    }

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount
      return acc
    }, {})

    const content = await generateTips(
      month,
      budget?.totalBudget ?? 0,
      totalSpent,
      categoryTotals
    )

    const tips = content
      .split('\n')
      .filter((line: string) => line.trim().match(/^\d+\.|^-|^•/))
      .map((line: string) => line.replace(/^\d+\.\s*|^[-•]\s*/, '').trim())
      .filter(Boolean)

    const aiTip = await AiTipModel.findOneAndUpdate(
      { userId: session.user.id, month },
      { userId: session.user.id, month, tips, generatedAt: new Date() },
      { upsert: true, new: true }
    )

    return NextResponse.json({ data: aiTip })
  } catch {
    return NextResponse.json({ error: 'Failed to generate tips' }, { status: 500 })
  }
}
