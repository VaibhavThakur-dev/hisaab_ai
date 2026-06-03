import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface ICategoryLimits {
  food: number;
  transport: number;
  shopping: number;
  bills: number;
  entertainment: number;
  health: number;
  education: number;
  other: number;
}

export interface IBudget extends Document {
  userId: Types.ObjectId;
  month: string; // "2026-06" format
  totalBudget: number; // in paise
  categoryLimits: ICategoryLimits;
  createdAt: Date;
}

const CategoryLimitsSchema = new Schema<ICategoryLimits>(
  {
    food: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    shopping: { type: Number, default: 0 },
    bills: { type: Number, default: 0 },
    entertainment: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  { _id: false }
);

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    totalBudget: { type: Number, required: true, min: 0 },
    categoryLimits: { type: CategoryLimitsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, month: 1 }, { unique: true });

const BudgetModel: Model<IBudget> =
  (mongoose.models.Budget as Model<IBudget>) ??
  mongoose.model<IBudget>('Budget', BudgetSchema);

export default BudgetModel;
