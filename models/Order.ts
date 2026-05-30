import mongoose, { Schema, Document } from 'mongoose'

export interface IOrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  category: 'mat_hire' | 'drink' | 'merchandise' | 'class' | 'class_pack' | 'membership'
  options?: Record<string, string>
}

export interface IOrder extends Document {
  orderNumber: string
  studioLocation: string
  customerName?: string
  customerEmail?: string
  items: IOrderItem[]
  total: number
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  paymentMethod: 'stripe_online' | 'pdq_card' | 'pdq_contactless'
  stripePaymentIntentId?: string
  drinkTiming?: 'before_class' | 'after_class' | 'now'
  classTime?: string
  notes?: string
  staffId?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: String,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  category: {
    type: String,
    enum: ['mat_hire', 'drink', 'merchandise', 'class', 'class_pack', 'membership'],
    required: true,
  },
  options: { type: Map, of: String },
})

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () => `YS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    },
    studioLocation: { type: String, default: 'main' },
    customerName: String,
    customerEmail: String,
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe_online', 'pdq_card', 'pdq_contactless'],
      required: true,
    },
    stripePaymentIntentId: String,
    drinkTiming: {
      type: String,
      enum: ['before_class', 'after_class', 'now'],
    },
    classTime: String,
    notes: String,
    staffId: String,
  },
  { timestamps: true }
)

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
