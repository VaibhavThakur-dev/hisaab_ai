import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json() as {
      email: string
      otp: string
      newPassword: string
    }

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    await connectDB()
    const user = await UserModel.findOne({ email: email.toLowerCase() })

    if (!user) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: 'No reset code found. Request a new one.' }, { status: 400 })
    }
    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ error: 'Reset code expired. Request a new one.' }, { status: 400 })
    }
    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 })
    }

    user.password = await bcrypt.hash(newPassword, 12)
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    return NextResponse.json({ message: 'Password reset successfully.' })
  } catch {
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
