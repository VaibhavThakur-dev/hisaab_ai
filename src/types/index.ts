export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'other';

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  currency: 'INR';
  createdAt: Date;
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number; // in paise (₹1 = 100 paise)
  category: Category;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface CategoryLimits {
  food: number;
  transport: number;
  shopping: number;
  bills: number;
  entertainment: number;
  health: number;
  education: number;
  other: number;
}

export interface Budget {
  _id: string;
  userId: string;
  month: string; // "2026-06" format
  totalBudget: number; // in paise
  categoryLimits: CategoryLimits;
  createdAt: Date;
}

export interface AiTip {
  _id: string;
  userId: string;
  month: string;
  tips: string[];
  analysis: string;
  generatedAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
