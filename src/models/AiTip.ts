import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAiTip extends Document {
  userId: Types.ObjectId;
  month: string;
  tips: string[];
  analysis: string;
  generatedAt: Date;
}

const AiTipSchema = new Schema<IAiTip>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  tips: [{ type: String }],
  analysis: { type: String, default: '' },
  generatedAt: { type: Date, default: Date.now },
});

AiTipSchema.index({ userId: 1, month: 1 }, { unique: true });

const AiTipModel: Model<IAiTip> =
  (mongoose.models.AiTip as Model<IAiTip>) ??
  mongoose.model<IAiTip>('AiTip', AiTipSchema);

export default AiTipModel;
