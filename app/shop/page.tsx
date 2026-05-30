'use client'
import { PRODUCTS, formatPrice } from '@/lib/products'
import CartButton from '@/components/CartButton'
import { useCart } from '@/components/CartContext'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const SUBCATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'accessories', label: 'Accessories' },
  { key: 'equipment', label: 'Equipment' },
]

function ShopContent() {
  const { dispatch } = useCart()
  const [activeTab, setActiveTab] = useState('all')
  const [added, setAdded] = useState<string | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Record<string, string>>>({})

  const filtered = PRODUCTS.merchandise.filter(
    (p) => activeTab === 'all' || p.subcategory === activeTab
  )

  const getVariant = (id: string, label: string, defaultVal: string) =>
    selectedVariants[id]?.[label] ?? defaultVal

  const setVariant = (id: string, label: string, value: string) =>
    setSelectedVariants((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [label]: value } }))

  const handleAdd = (item: (typeof PRODUCTS.merchandise)[0]) => {
    const options: Record<string, string> = {}
    item.variants?.forEach((v) => {
      options[v.label] = getVariant(item.id, v.label, v.options[0])
    })
    dispatch({ type: 'ADD_ITEM', item: { id: item.id, name: item.name, price: item.price, quantity: 1, category: 'merchandise', emoji: item.emoji, options } })
    setAdded(item.id)
    setTimeout(() => setAdded(null), 1500)
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8 pb-28">
      <Link href="/" className="inline-flex items-center gap-2 text-sage-600 text-sm mb-6 hover:text-sage-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="font-display text-4xl font-light mb-1">Studio Shop</h1>
      <p className="text-sage-600 text-sm mb-6">Thoughtfully made, beautifully designed</p>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {SUBCATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === cat.key
                ? 'bg-charcoal text-white shadow-sm'
                : 'bg-white text-sage-700 hover:bg-sage-50 border border-sage-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-sage-50 card-hover">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-sage-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sage-600 text-sm mt-0.5">{item.description}</p>
                <p className="font-display text-xl text-sage-700 mt-2">{formatPrice(item.price)}</p>
              </div>
            </div>

            {/* Variants */}
            {item.variants?.map((variant) => (
              <div key={variant.label} className="mt-3">
                <p className="text-xs text-sage-500 mb-1.5 font-medium">{variant.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {variant.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setVariant(item.id, variant.label, opt)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        getVariant(item.id, variant.label, variant.options[0]) === opt
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'border-sage-200 text-sage-700 hover:border-sage-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => handleAdd(item)}
              className={`mt-4 w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                added === item.id
                  ? 'bg-sage-500 text-white'
                  : 'bg-sage-100 text-sage-800 hover:bg-sage-200'
              }`}
            >
              {added === item.id ? (
                <span className="flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Added</span>
              ) : (
                'Add to bag'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
      <div className="min-h-screen blob-bg">
        <ShopContent />
        <CartButton />
      </div>
  )
}
