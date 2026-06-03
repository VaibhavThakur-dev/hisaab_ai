import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Expense, Category } from '@/types';

interface ExpenseFilters {
  month: string;
  category: Category | 'all';
}

interface ExpenseState {
  expenses: Expense[];
  filters: ExpenseFilters;
  isLoading: boolean;
  error: string | null;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Expense) => void;
  removeExpense: (id: string) => void;
  setFilters: (filters: Partial<ExpenseFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useExpenseStore = create<ExpenseState>()(
  devtools(
    (set) => ({
      expenses: [],
      filters: {
        month: new Date().toISOString().slice(0, 7),
        category: 'all',
      },
      isLoading: false,
      error: null,
      setExpenses: (expenses) => set({ expenses }),
      addExpense: (expense) =>
        set((state) => ({ expenses: [expense, ...state.expenses] })),
      updateExpense: (id, expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) => (e._id === id ? expense : e)),
        })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e._id !== id),
        })),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    { name: 'expense-store' }
  )
);

export default useExpenseStore;
