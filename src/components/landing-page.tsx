'use client'

import Link from 'next/link'
import { ArrowRight, BarChart2, Brain, IndianRupee, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/theme-toggle'

const features = [
  {
    icon: IndianRupee,
    title: 'Track Every Rupee',
    desc: 'Add expenses in seconds. Auto-categorized by AI.',
  },
  {
    icon: Wallet,
    title: 'Smart Budgets',
    desc: 'Set monthly limits per category. Get alerted before you overspend.',
  },
  {
    icon: BarChart2,
    title: 'Visual Analytics',
    desc: 'See exactly where your money goes with charts and trends.',
  },
  {
    icon: Sparkles,
    title: 'AI Saving Tips',
    desc: 'Personalized tips powered by AI based on your spending habits.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-5 h-14 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              ₹
            </div>
            <span className="font-bold text-foreground">
              <span className="text-primary">Hisaab</span>AI
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-5">

        {/* Hero */}
        <section className="pt-14 pb-10 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3 h-3" />
            AI-Powered Finance Tracker
          </div>

          <h1 className="text-4xl font-extrabold text-foreground leading-tight tracking-tight">
            Track smarter,<br />
            <span className="text-primary">save bigger</span>
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
            The only expense tracker that gives you AI-powered insights in Indian Rupees — built for India.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <Link href="/register" className="block">
              <Button className="w-full h-12 text-base font-bold rounded-2xl shadow-lg shadow-primary/25">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full h-12 text-base font-semibold rounded-2xl">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* App preview card */}
        <section className="pb-10">
          <div className="rounded-3xl bg-card border border-border shadow-xl overflow-hidden">
            {/* Fake status bar */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between">
              <span className="text-primary-foreground font-bold text-sm">HisaabAI</span>
              <span className="text-primary-foreground/80 text-xs font-medium">June 2026</span>
            </div>
            {/* Mock dashboard */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-extrabold text-foreground">₹18,450</p>
                  <p className="text-xs text-muted-foreground">₹11,550 remaining</p>
                </div>
                {/* Mini ring */}
                <svg width="72" height="72" className="-rotate-90">
                  <circle cx="36" cy="36" r="28" strokeWidth="6" className="fill-none stroke-muted" />
                  <circle cx="36" cy="36" r="28" strokeWidth="6" fill="none" stroke="#FF9500"
                    strokeLinecap="round" strokeDasharray="175.9" strokeDashoffset="61.6" />
                </svg>
              </div>
              {/* Mock expenses */}
              <div className="space-y-2 pt-1">
                {[
                  { emoji: '🍜', label: 'Zomato order', cat: 'Food', amt: '₹340' },
                  { emoji: '🚗', label: 'Ola cab', cat: 'Transport', amt: '₹180' },
                  { emoji: '🛍️', label: 'Myntra', cat: 'Shopping', amt: '₹1,299' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.cat}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-destructive">{item.amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pb-10 space-y-3">
          <h2 className="text-xl font-bold text-foreground text-center">Everything you need</h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-card border border-border p-4 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust badges */}
        <section className="pb-10">
          <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Private & Secure</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your data is encrypted and never sold. Google OAuth or email — your choice.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-12 text-center space-y-3">
          <p className="text-lg font-bold text-foreground">Ready to take control?</p>
          <p className="text-sm text-muted-foreground">Free forever. No credit card needed.</p>
          <Link href="/register" className="block">
            <Button className="w-full h-12 text-base font-bold rounded-2xl shadow-lg shadow-primary/25">
              Start for Free
              <Brain className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 HisaabAI · Made with ❤️ for India
        </p>
      </footer>

    </div>
  )
}
