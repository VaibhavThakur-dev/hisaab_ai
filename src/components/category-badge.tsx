import { cn } from '@/lib/utils'
import type { Category } from '@/types'

const config: Record<Category, { label: string; className: string; emoji: string }> = {
  food:          { label: 'Food',          className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300', emoji: '🍜' },
  transport:     { label: 'Transport',     className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',         emoji: '🚗' },
  shopping:      { label: 'Shopping',      className: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',         emoji: '🛍️' },
  bills:         { label: 'Bills',         className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300', emoji: '📄' },
  entertainment: { label: 'Entertainment', className: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', emoji: '🎬' },
  health:        { label: 'Health',        className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',     emoji: '💊' },
  education:     { label: 'Education',     className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',         emoji: '📚' },
  other:         { label: 'Other',         className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',         emoji: '📦' },
}

interface Props {
  category: Category
  size?: 'sm' | 'md'
}

export default function CategoryBadge({ category, size = 'md' }: Props) {
  const { label, className, emoji } = config[category]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <span>{emoji}</span>
      {label}
    </span>
  )
}

export { config as categoryConfig }
