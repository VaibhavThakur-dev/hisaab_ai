import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email: string }
    if (!body.email) {
      return NextResponse.json({ exists: false })
    }
    await connectDB()
    const user = await UserModel.findOne({ email: body.email.toLowerCase() }).select('isVerified')
    if (!user) return NextResponse.json({ exists: false })
    return NextResponse.json({ exists: true, isVerified: user.isVerified })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
