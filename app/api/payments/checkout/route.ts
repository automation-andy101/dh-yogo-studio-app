import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customerName, customerEmail, drinkTiming, classTime } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    // Build Stripe line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          description: item.options ? Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ') : undefined,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${appUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      metadata: {
        customerName,
        drinkTiming: drinkTiming || '',
        classTime: classTime || '',
      },
    })

    // Save pending order to DB
    await connectDB()
    await Order.create({
      customerName,
      customerEmail,
      items: items.map((item: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        options: item.options || {},
      })),
      total,
      status: 'pending',
      paymentMethod: 'stripe_online',
      stripePaymentIntentId: session.payment_intent as string,
      drinkTiming,
      classTime,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
