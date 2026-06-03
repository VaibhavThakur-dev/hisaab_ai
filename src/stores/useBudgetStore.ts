import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Budget } from '@/types';

interface BudgetState {
  budget: Budget | null;
  isLoading: boolean;
  error: string | null;
  setBudget: (budget: Budget | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useBudgetStore = create<BudgetState>()(
  devtools(
    (set) => ({
      budget: null,
      isLoading: false,
      error: null,
      setBudget: (budget) => set({ budget }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    { name: 'budget-store' }
  )
);

export default useBudgetStore;
