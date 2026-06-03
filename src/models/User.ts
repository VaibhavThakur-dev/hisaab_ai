import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  image?: string
  currency: 'INR'
  isVerified: boolean
  otp?: string
  otpExpiry?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, default: null },
    image:     { type: String, default: null },
    currency:  { type: String, default: 'INR', enum: ['INR'] },
    isVerified:{ type: Boolean, default: false },
    otp:       { type: String, default: null },
    otpExpiry: { type: Date,   default: null },
  },
  { timestamps: true }
)

const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ?? mongoose.model<IUser>('User', UserSchema)

export default UserModel
