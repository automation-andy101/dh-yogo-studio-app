import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  category: 'mat_hire' | 'drink' | 'merchandise' | 'class' | 'class_pack' | 'membership'
  subcategory?: string
  image?: string
  available: boolean
  stock?: number
  variants?: { label: string; options: string[] }[]
  stripeProductId?: string
  stripePriceId?: string
  metadata?: Record<string, string>
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ['mat_hire', 'drink', 'merchandise', 'class', 'class_pack', 'membership'],
      required: true,
    },
    subcategory: String,
    image: String,
    available: { type: Boolean, default: true },
    stock: Number,
    variants: [
      {
        label: String,
        options: [String],
      },
    ],
    stripeProductId: String,
    stripePriceId: String,
    metadata: { type: Map, of: String },
  },
  { timestamps: true }
)

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
