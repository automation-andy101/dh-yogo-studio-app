'use client'
import { useEffect, useState } from 'react'
import { Coffee, RefreshCw } from 'lucide-react'

interface Order {
  _id: string
  orderNumber: string
  customerName?: string
  items: any[]
  total: number
  status: string
  drinkTiming?: string
  createdAt: string
}

const TIMING_CONFIG = {
  before_class: { label: 'Before Class', color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700', icon: '⬆️' },
  now: { label: 'Right Now', color: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700', icon: '⚡' },
  after_class: { label: 'After Class', color: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-700', icon: '⬇️' },
}

export default function DrinksPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?limit=100')
      const data = await res.json()
      // Filter orders that contain drinks and are active
      const drinkOrders = (data.orders || []).filter((o: Order) =>
        o.items.some((i) => i.category === 'drink') &&
        ['paid', 'preparing', 'ready'].includes(o.status)
      )
      setOrders(drinkOrders)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 20000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders((prev) =>
      status === 'completed'
        ? prev.filter((o) => o._id !== id)
        : prev.map((o) => (o._id === id ? { ...o, status } : o))
    )
  }

  const groupedOrders = {
    before_class: orders.filter((o) => o.drinkTiming === 'before_class'),
    now: orders.filter((o) => o.drinkTiming === 'now' || !o.drinkTiming),
    after_class: orders.filter((o) => o.drinkTiming === 'after_class'),
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drink Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live board · {orders.length} active orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {orders.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Coffee className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No active drink orders</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {(Object.entries(groupedOrders) as [keyof typeof TIMING_CONFIG, Order[]][]).map(([timing, timingOrders]) => {
          const config = TIMING_CONFIG[timing]
          return (
            <div key={timing} className={`rounded-2xl border-2 ${config.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <span>{config.icon}</span> {config.label}
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${config.badge}`}>
                  {timingOrders.length}
                </span>
              </div>

              <div className="space-y-3">
                {timingOrders.map((order) => {
                  const drinks = order.items.filter((i) => i.category === 'drink')
                  return (
                    <div key={order._id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="font-semibold text-sm">{order.customerName || 'Customer'}</p>
                          <p className="text-xs text-gray-400 font-mono">{order.orderNumber}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === 'paid' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        {drinks.map((drink: any, i: number) => (
                          <div key={i} className="text-sm flex items-start gap-1.5">
                            <span>☕</span>
                            <div>
                              <span className="font-medium">{drink.name}</span>
                              {drink.options && Object.keys(drink.options).length > 0 && (
                                <span className="text-gray-500 text-xs ml-1">
                                  ({Object.values(drink.options).join(', ')})
                                </span>
                              )}
                              {drink.quantity > 1 && <span className="text-gray-400 ml-1">×{drink.quantity}</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {order.status === 'paid' && (
                          <button
                            onClick={() => updateStatus(order._id, 'preparing')}
                            className="flex-1 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors"
                          >
                            Start Making
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateStatus(order._id, 'ready')}
                            className="flex-1 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                          >
                            Mark Ready ✓
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateStatus(order._id, 'completed')}
                            className="flex-1 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            Collected ✓
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {timingOrders.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">None pending</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
