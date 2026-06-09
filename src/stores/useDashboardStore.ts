import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Expense, Category } from '@/types'

export interface DashboardData {
  totalSpent: number
  totalBudget: number
  remaining: number
  topCategory: { name: Category; amount: number } | null
  recentExpenses: Expense[]
  month: string
}

interface DashboardState {
  data: DashboardData | null
  isLoading: boolean
  setData: (data: DashboardData | null) => void
  setLoading: (loading: boolean) => void
}

const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      data: null,
      isLoading: false,
      setData: (data) => set({ data }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'dashboard-store' }
  )
)

export default useDashboardStore
