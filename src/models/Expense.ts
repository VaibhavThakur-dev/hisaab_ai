import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { Category } from '@/types';

export interface IExpense extends Document {
  userId: Types.ObjectId;
  amount: number; // in paise (₹1 = 100 paise)
  category: Category;
  description: string;
  date: Date;
  createdAt: Date;
}

const CATEGORIES: Category[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'entertainment',
  'health',
  'education',
  'other',
];

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    category: { type: String, enum: CATEGORIES, required: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });

const ExpenseModel: Model<IExpense> =
  (mongoose.models.Expense as Model<IExpense>) ??
  mongoose.model<IExpense>('Expense', ExpenseSchema);

export default ExpenseModel;
