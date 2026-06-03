import BottomNav from '@/components/bottom-nav'
import ThemeToggle from '@/components/theme-toggle'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-12 max-w-lg mx-auto">
          <span className="font-bold text-base text-foreground">
            <span className="text-primary">Hisaab</span>AI
          </span>
          <ThemeToggle />
        </div>
      </header>
      <main className="pb-20 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
