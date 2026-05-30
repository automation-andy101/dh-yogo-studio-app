import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const paymentIntentId = session.payment_intent as string

    await connectDB()

    // Try finding by payment intent ID
    let order = await Order.findOne({ stripePaymentIntentId: paymentIntentId }).lean() as any

    // Fallback: find most recent pending order by email
    if (!order && session.customer_email) {
      order = await Order.findOne({ 
        customerEmail: session.customer_email,
        status: { $in: ['pending', 'paid'] }
      }).sort({ createdAt: -1 }).lean() as any
    }

    // If found, mark as paid
    if (order && order.status === 'pending') {
      await Order.findByIdAndUpdate(order._id, { status: 'paid' })
      order.status = 'paid'
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Order lookup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}