import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ExpenseModel from '@/models/Expense'
import type { Category } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)
    const category = searchParams.get('category')

    const [year, mon] = month.split('-').map(Number)
    const startDate = new Date(year, mon - 1, 1)
    const endDate = new Date(year, mon, 0, 23, 59, 59, 999)

    await connectDB()

    const filter: Record<string, unknown> = {
      userId: session.user.id,
      date: { $gte: startDate, $lte: endDate },
    }
    if (category && category !== 'all') filter.category = category

    const expenses = await ExpenseModel.find(filter).sort({ date: -1 }).lean()

    return NextResponse.json({ data: expenses })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      amount: number
      category: Category
      description: string
      date: string
    }

    if (!body.amount || !body.category || !body.description) {
      return NextResponse.json({ error: 'amount, category, description are required' }, { status: 400 })
    }

    await connectDB()

    const expense = await ExpenseModel.create({
      userId: session.user.id,
      amount: Math.round(body.amount * 100), // convert ₹ to paise
      category: body.category,
      description: body.description.trim(),
      date: body.date ? new Date(body.date) : new Date(),
    })

    return NextResponse.json({ data: expense }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
