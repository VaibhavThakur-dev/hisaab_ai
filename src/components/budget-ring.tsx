'use client'

interface Props {
  spent: number   // in paise
  budget: number  // in paise
  size?: number
}

export default function BudgetRing({ spent, budget, size = 120 }: Props) {
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - pct)
  const isOver = spent > budget && budget > 0

  const spentStr = `₹${(spent / 100).toLocaleString('en-IN')}`
  const budgetStr = budget > 0 ? `₹${(budget / 100).toLocaleString('en-IN')}` : '—'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={8}
            className="fill-none stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={8}
            fill="none"
            stroke={isOver ? 'var(--color-destructive)' : 'var(--color-primary)'}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-foreground leading-none">{spentStr}</span>
          <span className="text-[9px] text-muted-foreground mt-0.5">of {budgetStr}</span>
        </div>
      </div>
      {isOver && (
        <span className="text-[10px] font-semibold text-destructive">Over budget!</span>
      )}
    </div>
  )
}
