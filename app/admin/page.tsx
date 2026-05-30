'use client'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/products'
import { ShoppingBag, Coffee, TrendingUp, Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface Order {
  _id: string
  orderNumber: string
  customerName?: string
  items: any[]
  total: number
  status: string
  paymentMethod: string
  drinkTiming?: string
  classTime?: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'status-pending',
  paid: 'status-paid',
  preparing: 'status-preparing',
  ready: 'status-ready',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const DRINK_TIMING_LABELS: Record<string, { label: string; color: string }> = {
  before_class: { label: 'Before class', color: 'bg-blue-100 text-blue-700' },
  after_class: { label: 'After class', color: 'bg-purple-100 text-purple-700' },
  now: { label: 'Right now', color: 'bg-orange-100 text-orange-700' },
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders?limit=30')
      const data = await res.json()
      setOrders(data.orders || [])
      setLastRefresh(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000) // auto-refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)))
  }

  // Stats
  const today = new Date().toDateString()
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today)
  const todayRevenue = todayOrders.filter((o) => ['paid', 'preparing', 'ready', 'completed'].includes(o.status)).reduce((s, o) => s + o.total, 0)
  const pendingDrinks = orders.filter((o) => o.items.some((i) => i.category === 'drink') && ['paid', 'preparing'].includes(o.status))
  const activeOrders = orders.filter((o) => ['paid', 'preparing', 'ready'].includes(o.status))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Last updated: {lastRefresh.toLocaleTimeString('en-GB')}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Revenue", value: formatPrice(todayRevenue), icon: TrendingUp, color: 'text-sage-600', bg: 'bg-sage-50' },
          { label: "Today's Orders", value: todayOrders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Orders', value: activeOrders.length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pending Drinks', value: pendingDrinks.length, icon: Coffee, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Drink timing breakdown */}
      {pendingDrinks.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-clay-500" />
            Pending Drink Orders
          </h2>
          <div className="space-y-3">
            {pendingDrinks.map((order) => (
              <div key={order._id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{order.customerName || 'Walk-in'}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {order.items.filter((i) => i.category === 'drink').map((drink: any, idx: number) => (
                      <span key={idx} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                        {drink.name} {drink.options ? `(${Object.values(drink.options).join(', ')})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {order.drinkTiming && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${DRINK_TIMING_LABELS[order.drinkTiming]?.color}`}>
                      {DRINK_TIMING_LABELS[order.drinkTiming]?.label}
                    </span>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => updateStatus(order._id, 'preparing')} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">Preparing</button>
                    <button onClick={() => updateStatus(order._id, 'ready')} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">Ready ✓</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold">Recent Orders</h2>
          <a href="/admin/orders" className="text-sage-600 text-sm hover:underline">View all</a>
        </div>

        {loading && orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="spinner w-6 h-6 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No orders yet today</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
                  <th className="text-left px-5 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Items</th>
                  <th className="text-left px-4 py-3">Timing</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 15).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{order.orderNumber}</td>
                    <td className="px-4 py-3 font-medium">{order.customerName || 'Walk-in'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <p className="truncate">
                        {order.items.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {order.drinkTiming && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DRINK_TIMING_LABELS[order.drinkTiming]?.color || 'bg-gray-100 text-gray-600'}`}>
                          {DRINK_TIMING_LABELS[order.drinkTiming]?.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-sage-400 cursor-pointer"
                      >
                        {['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'].map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
