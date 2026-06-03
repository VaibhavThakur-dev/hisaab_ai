import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'
import { generateOtp, sendOtpEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email: string }
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    const user = await UserModel.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Already verified' }, { status: 200 })
    }

    // Rate limit: don't resend if last OTP was sent < 60s ago
    if (user.otpExpiry) {
      const otpAge = (user.otpExpiry.getTime() - 10 * 60 * 1000)
      if (Date.now() - otpAge < 60 * 1000) {
        return NextResponse.json({ error: 'Please wait 60 seconds before requesting a new code.' }, { status: 429 })
      }
    }

    const otp = generateOtp()
    user.otp = otp
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendOtpEmail(email.toLowerCase(), user.name, otp)

    return NextResponse.json({ message: 'New OTP sent to your email.' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
