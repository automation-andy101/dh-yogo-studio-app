'use client'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/products'
import { TrendingUp, ShoppingBag, Coffee, CreditCard, Users } from 'lucide-react'

interface Order {
  _id: string
  items: any[]
  total: number
  status: string
  paymentMethod: string
  drinkTiming?: string
  createdAt: string
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders?limit=500')
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setLoading(false) })
  }, [])

  const paid = orders.filter((o) => ['paid', 'preparing', 'ready', 'completed'].includes(o.status))
  const totalRevenue = paid.reduce((s, o) => s + o.total, 0)

  // Category breakdown
  const categoryRevenue: Record<string, number> = {}
  paid.forEach((o) => {
    o.items.forEach((item) => {
      const cat = item.category || 'other'
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.price * item.quantity
    })
  })

  // Payment method breakdown
  const paymentBreakdown: Record<string, number> = {}
  paid.forEach((o) => {
    paymentBreakdown[o.paymentMethod] = (paymentBreakdown[o.paymentMethod] || 0) + 1
  })

  // Drink timing breakdown
  const drinkTimingBreakdown: Record<string, number> = {}
  orders.filter((o) => o.items.some((i) => i.category === 'drink')).forEach((o) => {
    const t = o.drinkTiming || 'unknown'
    drinkTimingBreakdown[t] = (drinkTimingBreakdown[t] || 0) + 1
  })

  // 7-day revenue
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toDateString()
  })
  const dailyRevenue = days7.map((day) => ({
    label: new Date(day).toLocaleDateString('en-GB', { weekday: 'short' }),
    value: paid.filter((o) => new Date(o.createdAt).toDateString() === day).reduce((s, o) => s + o.total, 0),
  }))
  const maxDay = Math.max(...dailyRevenue.map((d) => d.value), 1)

  const CATEGORY_LABELS: Record<string, string> = {
    mat_hire: '🧘 Mat Hire',
    drink: '☕ Drinks',
    merchandise: '👕 Merchandise',
    class: '📅 Classes',
    class_pack: '📦 Class Packs',
    membership: '♾️ Memberships',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
      <p className="text-gray-500 text-sm mb-6">Revenue and order insights</p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-sage-600 bg-sage-50' },
          { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
          { label: 'Drink Orders', value: orders.filter((o) => o.items.some((i) => i.category === 'drink')).length, icon: Coffee, color: 'text-amber-600 bg-amber-50' },
          { label: 'Online Payments', value: orders.filter((o) => o.paymentMethod === 'stripe_online').length, icon: CreditCard, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color.split(' ')[1]}`}>
              <Icon className={`w-5 h-5 ${color.split(' ')[0]}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* 7-day bar chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="font-semibold mb-5">Revenue (Last 7 Days)</h2>
          <div className="flex items-end gap-2 h-32">
            {dailyRevenue.map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-sage-200 rounded-t-md transition-all duration-500"
                  style={{ height: `${(day.value / maxDay) * 100}%`, minHeight: day.value > 0 ? '4px' : '2px' }}
                />
                <span className="text-xs text-gray-500">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="font-semibold mb-4">Revenue by Category</h2>
          <div className="space-y-3">
            {Object.entries(categoryRevenue)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, rev]) => {
                const pct = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{CATEGORY_LABELS[cat] || cat}</span>
                      <span className="font-medium">{formatPrice(rev)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sage-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            {Object.keys(categoryRevenue).length === 0 && (
              <p className="text-gray-400 text-sm">No data yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Drink timing */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Coffee className="w-4 h-4 text-amber-500" /> Drink Timing Preferences</h2>
          <div className="space-y-3">
            {[
              { key: 'before_class', label: 'Before class', color: 'bg-blue-400' },
              { key: 'now', label: 'Right now', color: 'bg-orange-400' },
              { key: 'after_class', label: 'After class', color: 'bg-purple-400' },
            ].map(({ key, label, color }) => {
              const count = drinkTimingBreakdown[key] || 0
              const total = Object.values(drinkTimingBreakdown).reduce((s, v) => s + v, 0) || 1
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment methods */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-purple-500" /> Payment Methods</h2>
          <div className="space-y-3">
            {[
              { key: 'stripe_online', label: '💳 Online (Stripe)' },
              { key: 'pdq_card', label: '📳 PDQ Chip & PIN' },
              { key: 'pdq_contactless', label: '📲 PDQ Contactless' },
            ].map(({ key, label }) => {
              const count = paymentBreakdown[key] || 0
              const total = Object.values(paymentBreakdown).reduce((s, v) => s + v, 0) || 1
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sage-500 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold w-6 text-right">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
