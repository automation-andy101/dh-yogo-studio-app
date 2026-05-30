import mongoose, { Schema, Document } from 'mongoose'

export interface IStaff extends Document {
  email: string
  password: string
  name: string
  createdAt: Date
}

const StaffSchema = new Schema<IStaff>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema)
