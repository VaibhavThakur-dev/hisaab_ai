'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Receipt, Plus, Wallet, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/expenses/add', icon: Plus, label: 'Add', isCenter: true },
  { href: '/budget', icon: Wallet, label: 'Budget' },
  { href: '/ai-tips', icon: Sparkles, label: 'AI Tips' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label, isCenter }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

          if (isCenter) {
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center -mt-5 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              >
                <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
              </Link>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full pt-1',
                'text-muted-foreground transition-colors',
                isActive && 'text-primary'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
