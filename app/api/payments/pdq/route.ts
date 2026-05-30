import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customerName, customerEmail, staffId, paymentMethod = 'pdq_card' } = body

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    // Create a Stripe PaymentIntent for PDQ
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'gbp',
      payment_method_types: ['card_present'],
      capture_method: 'manual',
      metadata: { customerName: customerName || 'Walk-in', staffId: staffId || 'unknown' },
    })

    await connectDB()
    const order = await Order.create({
      customerName,
      customerEmail,
      items: items.map((item: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      })),
      total,
      status: 'paid',
      paymentMethod,
      stripePaymentIntentId: paymentIntent.id,
      staffId,
    })

    return NextResponse.json({ order, paymentIntentId: paymentIntent.id })
  } catch (error: any) {
    console.error('PDQ error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
