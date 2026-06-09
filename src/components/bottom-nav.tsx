'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Home, Receipt, Plus, Sparkles, Menu, BarChart2, Wallet, User, LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const leftNav = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/expenses', icon: Receipt, label: 'Expenses' },
]

const rightNav = [
  { href: '/ai-tips', icon: Sparkles, label: 'AI' },
]

const moreLinks = [
  { href: '/charts', icon: BarChart2, label: 'Charts', description: 'Spending trends & graphs' },
  { href: '/budget', icon: Wallet, label: 'Budget', description: 'Set & track monthly budget' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [moreOpen, setMoreOpen] = useState(false)

  const isMoreActive = ['/charts', '/budget'].some((p) => pathname.startsWith(p))

  const handleSignOut = async () => {
    setMoreOpen(false)
    await signOut({ redirect: false })
    router.push('/login')
  }

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center h-16 max-w-lg mx-auto">
          {/* Left: Home, Expenses */}
          {leftNav.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 h-full pt-1',
                  'text-muted-foreground transition-colors',
                  isActive && 'text-primary'
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}

          {/* Centre + button — flex-1 wrapper keeps it equal width */}
          <div className="flex-1 flex items-center justify-center">
            <Link
              href="/expenses/add"
              className="flex items-center justify-center -mt-5 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </Link>
          </div>

          {/* Right: AI */}
          {rightNav.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 h-full pt-1',
                  'text-muted-foreground transition-colors',
                  isActive && 'text-primary'
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}

          {/* More */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 h-full pt-1',
              'text-muted-foreground transition-colors',
              isMoreActive && 'text-primary'
            )}
          >
            <Menu className="w-5 h-5" strokeWidth={isMoreActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
          <SheetTitle className="sr-only">Menu</SheetTitle>

          {/* Profile strip */}
          <div className="flex items-center gap-3 py-4 border-b border-border">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={session?.user?.image ?? ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{session?.user?.name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email ?? ''}</p>
            </div>
          </div>

          {/* All menu items */}
          <div className="py-2 space-y-0.5">
            {moreLinks.map(({ href, icon: Icon, label, description }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                  )}
                >
                  <div className={cn('p-1.5 rounded-lg shrink-0', isActive ? 'bg-primary/15' : 'bg-muted')}>
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </Link>
              )
            })}

            <Separator className="my-1" />

            <Link
              href="/profile"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-muted shrink-0">
                <User className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">Profile</p>
                <p className="text-xs text-muted-foreground">Account settings</p>
              </div>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-destructive/10 shrink-0">
                <LogOut className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium leading-tight">Sign out</p>
                <p className="text-xs text-muted-foreground/70">Log out of your account</p>
              </div>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
