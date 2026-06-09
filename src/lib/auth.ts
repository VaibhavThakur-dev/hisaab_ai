import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import connectDB from './mongodb'
import UserModel from '@/models/User'
import { authConfig } from '@/auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()

        const user = await UserModel.findOne({
          email: (credentials.email as string).toLowerCase(),
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null

        // Block unverified accounts
        if (!user.isVerified) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image ?? null,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user?.id) token.id = user.id
      if (trigger === 'update' && session?.name) {
        token.name = session.name as string
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string
      if (token.name) session.user.name = token.name as string
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user.email) return true
      const email = user.email
      await connectDB()
      const existing = await UserModel.findOne({ email })
      if (!existing) {
        await UserModel.create({
          name: user.name ?? email,
          email,
          image: user.image ?? undefined,
          currency: 'INR',
          isVerified: true, // Google accounts are auto-verified
        })
      } else if (!existing.isVerified) {
        // Auto-verify Google sign-ins for existing unverified accounts
        existing.isVerified = true
        await existing.save()
      }
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})
