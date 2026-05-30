import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  const page = parseInt(searchParams.get('page') || '1')

  const filter: any = {}
  if (status && status !== 'all') filter.status = status

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean()

  const total = await Order.countDocuments(filter)

  return NextResponse.json({ orders, total, page, limit })
}

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()

  const order = await Order.create({
    ...body,
    paymentMethod: body.paymentMethod || 'pdq_card',
    status: 'paid',
  })

  return NextResponse.json({ order }, { status: 201 })
}
