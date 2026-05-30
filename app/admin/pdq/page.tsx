'use client'
import { useState } from 'react'
import { PRODUCTS, formatPrice } from '@/lib/products'
import { CreditCard, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  emoji: string
}

const TABS = [
  { key: 'class', label: 'Single / Classes' },
  { key: 'pack', label: 'Class Packs' },
  { key: 'membership', label: 'Memberships' },
  { key: 'other', label: 'Other' },
]

export default function PDQPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [activeTab, setActiveTab] = useState('class')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'pdq_card' | 'pdq_contactless'>('pdq_card')

  const allProducts = [
    ...PRODUCTS.classes,
    ...PRODUCTS.matHire,
    ...PRODUCTS.drinks.slice(0, 3),
  ]

  const filteredProducts = allProducts.filter((p) => {
    if (activeTab === 'class') return p.category === 'class'
    if (activeTab === 'pack') return p.category === 'class_pack'
    if (activeTab === 'membership') return p.category === 'membership'
    return ['mat_hire', 'drink', 'merchandise'].includes(p.category)
  })

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, category: item.category, emoji: item.emoji || '📦' }]
    })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.id !== id))
    else setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i))
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const handleCharge = async () => {
    if (cart.length === 0) return
    setLoading(true)
    try {
      await fetch('/api/payments/pdq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, customerName, customerEmail, paymentMethod }),
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setCart([])
        setCustomerName('')
        setCustomerEmail('')
      }, 2500)
    } catch (e) {
      alert('Error processing payment')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-sage-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Complete</h2>
        <p className="text-gray-500 mt-2">Order recorded successfully</p>
        <p className="text-3xl font-bold text-sage-700 mt-4">{formatPrice(total)}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">PDQ Payment</h1>
      <p className="text-gray-500 text-sm mb-6">Process in-person card payments for classes and services</p>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Product selector */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-xl p-4 text-left border border-gray-100 hover:border-sage-300 hover:shadow-sm transition-all group"
              >
                <span className="text-2xl">{(item as any).emoji || '📦'}</span>
                <p className="font-medium text-sm mt-2 group-hover:text-sage-700">{item.name}</p>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                <p className="font-bold text-sage-700 mt-2">{formatPrice(item.price)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart + checkout */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 sticky top-6">
            <h2 className="font-semibold mb-4">Order</h2>

            {/* Customer */}
            <div className="space-y-2 mb-4">
              <input
                placeholder="Customer name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sage-400"
              />
              <input
                placeholder="Email (optional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sage-400"
              />
            </div>

            {/* Cart items */}
            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No items added</p>
            ) : (
              <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-lg">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment method */}
            <div className="flex gap-2 mb-4">
              {(['pdq_card', 'pdq_contactless'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-2 text-xs rounded-xl border font-medium transition-all ${
                    paymentMethod === m ? 'bg-charcoal text-white border-charcoal' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {m === 'pdq_card' ? '💳 Chip & PIN' : '📲 Contactless'}
                </button>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-4 py-3 border-t border-gray-100">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
            </div>

            <button
              onClick={handleCharge}
              disabled={cart.length === 0 || loading}
              className="w-full bg-sage-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-sage-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2"><div className="spinner w-4 h-4" /> Processing...</span>
              ) : (
                <><CreditCard className="w-5 h-5" /> Charge {formatPrice(total)}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
