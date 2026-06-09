import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'
import { generateOtp, sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email: string }
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    await connectDB()
    const user = await UserModel.findOne({ email: email.toLowerCase() })

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json({ message: 'If this email exists, a reset code has been sent.' })
    }

    const otp = generateOtp()
    user.otp = otp
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendPasswordResetEmail(user.email, user.name, otp)
    return NextResponse.json({ message: 'Reset code sent to your email.' })
  } catch {
    return NextResponse.json({ error: 'Failed to send reset code' }, { status: 500 })
  }
}
