import type { NextAuthConfig } from 'next-auth'

const protectedPaths = ['/dashboard', '/expenses', '/budget', '/charts', '/ai-tips']
const authPaths = ['/login', '/register', '/verify-otp']

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
      const isAuthPage = authPaths.some((p) => pathname.startsWith(p))

      if (isProtected && !isLoggedIn) return false
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
