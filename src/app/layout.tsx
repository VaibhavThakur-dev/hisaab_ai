import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import NextAuthSessionProvider from '@/components/session-provider'
import ThemeProvider from '@/components/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HisaabAI — AI-powered Expense Tracker',
  description: 'Track daily expenses, set budgets, and get AI-powered saving tips.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'HisaabAI' },
}

export const viewport: Viewport = {
  themeColor: '#FF9500',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <NextAuthSessionProvider>
            {children}
            <Toaster richColors position="top-center" />
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
