import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import BudgetModel from '@/models/Budget'
import type { CategoryLimits } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)

    await connectDB()

    const budget = await BudgetModel.findOne({ userId: session.user.id, month }).lean()

    return NextResponse.json({ data: budget })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      month?: string
      totalBudget: number
      categoryLimits?: Partial<CategoryLimits>
    }

    if (!body.totalBudget) {
      return NextResponse.json({ error: 'totalBudget is required' }, { status: 400 })
    }

    const month = body.month ?? new Date().toISOString().slice(0, 7)

    await connectDB()

    const budget = await BudgetModel.findOneAndUpdate(
      { userId: session.user.id, month },
      {
        userId: session.user.id,
        month,
        totalBudget: Math.round(body.totalBudget * 100), // convert ₹ to paise
        categoryLimits: Object.fromEntries(
          Object.entries(body.categoryLimits ?? {}).map(([k, v]) => [k, Math.round((v ?? 0) * 100)])
        ),
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ data: budget }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 })
  }
}
