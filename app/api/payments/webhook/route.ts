import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await connectDB()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    await Order.findOneAndUpdate(
      { stripePaymentIntentId: session.payment_intent },
      { status: 'paid' }
    )
  }

  return NextResponse.json({ received: true })
}
