'use client'

import { Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const password = searchParams.get('p') ?? ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [resending, setResending] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const submitOtp = useCallback(async (otp: string) => {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })
    const data = await res.json() as { message?: string; error?: string }

    if (!res.ok) {
      setError(data.error ?? 'Verification failed')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      setLoading(false)
      return
    }

    setSuccess(true)

    // Auto sign-in if password was passed
    if (password) {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (!result?.error) {
        router.push('/dashboard')
        return
      }
    }

    setTimeout(() => router.push('/login?verified=true'), 1500)
  }, [email, password, router])

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (digits.every((d) => d !== '')) {
      submitOtp(digits.join(''))
    }
  }, [digits, submitOtp])

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = cleaned
    setDigits(next)
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json() as { message?: string; error?: string }
    if (!res.ok) {
      setError(data.error ?? 'Failed to resend OTP')
    } else {
      setResendCooldown(60)
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
    setResending(false)
  }

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1***$2')

  if (success) {
    return (
      <div className="w-full max-w-sm flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Email verified!</h2>
        <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-3xl font-bold shadow-lg shadow-primary/30">
          ₹
        </div>
        <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to<br />
          <span className="font-semibold text-foreground">{maskedEmail}</span>
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Enter verification code</CardTitle>
          <CardDescription>Code expires in 10 minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 6 digit boxes */}
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                className={`
                  w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background
                  transition-all outline-none
                  ${digit ? 'border-primary text-primary' : 'border-border text-foreground'}
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  disabled:opacity-50
                `}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center font-medium">{error}</p>
          )}

          <Button
            className="w-full"
            disabled={loading || digits.some((d) => !d)}
            onClick={() => submitOtp(digits.join(''))}
          >
            {loading ? 'Verifying…' : 'Verify'}
          </Button>

          <div className="text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in <span className="font-semibold text-foreground">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-primary font-semibold hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Wrong email?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Go back
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm animate-pulse space-y-4"><div className="h-16 w-16 mx-auto rounded-2xl bg-muted" /><div className="h-64 rounded-2xl bg-muted" /></div>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
