'use client'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/products'
import { RefreshCw, Search } from 'lucide-react'

interface Order {
  _id: string
  orderNumber: string
  customerName?: string
  customerEmail?: string
  items: any[]
  total: number
  status: string
  paymentMethod: string
  drinkTiming?: string
  createdAt: string
}

const STATUS_OPTIONS = ['all', 'pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled']
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100', ...(statusFilter !== 'all' ? { status: statusFilter } : {}) })
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)))
  }

  const filtered = orders.filter((o) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.customerEmail?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sage-400 w-64"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        {loading && filtered.length === 0 ? (
          <div className="p-12 text-center"><div className="spinner w-6 h-6 mx-auto" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3">Order #</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Items</th>
                  <th className="text-left px-4 py-3">Payment</th>
                  <th className="text-left px-4 py-3">Drink Timing</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customerName || 'Walk-in'}</p>
                      {order.customerEmail && <p className="text-xs text-gray-400">{order.customerEmail}</p>}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-xs text-gray-600 truncate">
                        {order.items.map((i) => i.name).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 capitalize">{order.paymentMethod?.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      {order.drinkTiming && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 capitalize">
                          {order.drinkTiming.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium cursor-pointer focus:outline-none ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}
                      >
                        {['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'].map((s) => (
                          <option key={s} value={s} className="bg-white text-gray-900">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-10 text-sm">No orders found</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
