import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ExpenseModel from '@/models/Expense'
import AiTipModel from '@/models/AiTip'
import { generateAnalysis } from '@/lib/openrouter'

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

    const expenses = await ExpenseModel.find({
      userId: session.user.id,
      date: { $gte: startDate, $lte: endDate },
    }).lean()

    if (expenses.length === 0) {
      return NextResponse.json({ error: 'No expenses found for this month' }, { status: 400 })
    }

    const expenseList = expenses
      .map((e) => `${e.description} (${e.category}): ₹${(e.amount / 100).toLocaleString('en-IN')}`)
      .join('\n')

    const analysis = await generateAnalysis(month, expenseList)

    const aiTip = await AiTipModel.findOneAndUpdate(
      { userId: session.user.id, month },
      { analysis, generatedAt: new Date() },
      { upsert: true, new: true }
    )

    return NextResponse.json({ data: aiTip })
  } catch {
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 })
  }
}
