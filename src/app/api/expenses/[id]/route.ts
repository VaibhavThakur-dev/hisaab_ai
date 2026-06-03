import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ExpenseModel from '@/models/Expense'
import type { Category } from '@/types'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json() as {
      amount?: number
      category?: Category
      description?: string
      date?: string
    }

    await connectDB()

    const update: Record<string, unknown> = {}
    if (body.amount !== undefined) update.amount = Math.round(body.amount * 100)
    if (body.category) update.category = body.category
    if (body.description) update.description = body.description.trim()
    if (body.date) update.date = new Date(body.date)

    const expense = await ExpenseModel.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      update,
      { new: true }
    )

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({ data: expense })
  } catch {
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const expense = await ExpenseModel.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Expense deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
