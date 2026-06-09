import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface MonthlyPoint {
  month: string
  amount: number
}

interface ChartsState {
  categoryTotals: Record<string, number>
  totalSpent: number
  monthlyData: MonthlyPoint[]
  isLoading: boolean
  month: string
  setCategoryData: (totalSpent: number, categoryTotals: Record<string, number>) => void
  setMonthlyData: (data: MonthlyPoint[]) => void
  setLoading: (loading: boolean) => void
  setMonth: (month: string) => void
}

const useChartsStore = create<ChartsState>()(
  devtools(
    (set) => ({
      categoryTotals: {},
      totalSpent: 0,
      monthlyData: [],
      isLoading: false,
      month: new Date().toISOString().slice(0, 7),
      setCategoryData: (totalSpent, categoryTotals) => set({ totalSpent, categoryTotals }),
      setMonthlyData: (monthlyData) => set({ monthlyData }),
      setLoading: (isLoading) => set({ isLoading }),
      setMonth: (month) => set({ month }),
    }),
    { name: 'charts-store' }
  )
)

export default useChartsStore
