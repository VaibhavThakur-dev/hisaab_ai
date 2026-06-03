import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'
import { generateOtp, sendOtpEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name: string; email: string; password: string }
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    await connectDB()

    const existing = await UserModel.findOne({ email: email.toLowerCase() })
    if (existing) {
      if (existing.isVerified) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      // Resend OTP for unverified account
      const otp = generateOtp()
      existing.otp = otp
      existing.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
      await existing.save()
      await sendOtpEmail(email.toLowerCase(), existing.name, otp)
      return NextResponse.json({ message: 'OTP resent. Please verify your email.' }, { status: 200 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      currency: 'INR',
      isVerified: false,
      otp,
      otpExpiry,
    })

    await sendOtpEmail(email.toLowerCase(), name.trim(), otp)

    return NextResponse.json({ message: 'Account created. Check your email for the OTP.' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
