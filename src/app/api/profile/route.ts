import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await UserModel.findById(session.user.id).select('-otp -otpExpiry').lean()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { password, ...rest } = user
    return NextResponse.json({ data: { ...rest, hasPassword: !!password } })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as {
      name?: string
      currentPassword?: string
      newPassword?: string
    }

    await connectDB()
    const user = await UserModel.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (body.name !== undefined) {
      const trimmed = body.name.trim()
      if (!trimmed) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      user.name = trimmed
    }

    if (body.newPassword) {
      if (!user.password) {
        return NextResponse.json({ error: 'Password change not available for Google accounts' }, { status: 400 })
      }
      if (!body.currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
      }
      const valid = await bcrypt.compare(body.currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
      }
      user.password = await bcrypt.hash(body.newPassword, 12)
    }

    await user.save()
    return NextResponse.json({ message: 'Profile updated' })
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
