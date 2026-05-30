'use client'
import { PRODUCTS, formatPrice } from '@/lib/products'
import { useCart } from '@/components/CartContext'
import { ArrowLeft, Check, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const SUBCATEGORIES = [
  { key: 'coffee', label: 'Coffee & Tea', emoji: '☕' },
  { key: 'smoothie', label: 'Smoothies', emoji: '🥤' },
  { key: 'juice', label: 'Cold Press', emoji: '🍊' },
]

const TIMING_OPTIONS = [
  { value: 'before_class', label: 'Before class', icon: '⬆️', desc: "Ready when you arrive" },
  { value: 'now', label: 'Right now', icon: '⚡', desc: 'Prepare immediately' },
  { value: 'after_class', label: 'After class', icon: '⬇️', desc: "Ready when you finish" },
]

export default function DrinksPage() {
  const { state, dispatch } = useCart()
  const [activeTab, setActiveTab] = useState('coffee')
  const [added, setAdded] = useState<string | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Record<string, string>>>({})
  const [showTimingModal, setShowTimingModal] = useState(false)
  const [pendingItem, setPendingItem] = useState<any>(null)

  const filtered = PRODUCTS.drinks.filter((d) => d.subcategory === activeTab)

  const getVariant = (productId: string, label: string, defaultVal: string) =>
    selectedVariants[productId]?.[label] ?? defaultVal

  const setVariant = (productId: string, label: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [label]: value },
    }))
  }

  const handleAddDrink = (drink: (typeof PRODUCTS.drinks)[0]) => {
    const options: Record<string, string> = {}
    drink.variants?.forEach((v) => {
      options[v.label] = getVariant(drink.id, v.label, v.options[0])
    })
    const item = { id: drink.id, name: drink.name, price: drink.price, quantity: 1, category: 'drink', emoji: drink.emoji, options }

    if (!state.drinkTiming) {
      setPendingItem(item)
      setShowTimingModal(true)
    } else {
      dispatch({ type: 'ADD_ITEM', item })
      setAdded(drink.id)
      setTimeout(() => setAdded(null), 1500)
    }
  }

  const confirmTiming = (timing: 'before_class' | 'after_class' | 'now') => {
    dispatch({ type: 'SET_DRINK_TIMING', timing })
    if (pendingItem) {
      dispatch({ type: 'ADD_ITEM', item: pendingItem })
      setAdded(pendingItem.id)
      setTimeout(() => setAdded(null), 1500)
    }
    setPendingItem(null)
    setShowTimingModal(false)
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8 pb-28">
      <Link href="/" className="inline-flex items-center gap-2 text-sage-600 text-sm mb-6 hover:text-sage-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="font-display text-4xl font-light mb-1">Order a Drink</h1>
      <p className="text-sage-600 text-sm mb-6">Freshly made to order</p>

      {/* Timing banner if set */}
      {state.drinkTiming && (
        <div className="mb-5 bg-sage-50 border border-sage-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-sage-700">
            <Clock className="w-4 h-4" />
            <span>Drink timing: <strong>{TIMING_OPTIONS.find(t => t.value === state.drinkTiming)?.label}</strong></span>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_DRINK_TIMING', timing: undefined as any })}
            className="text-xs text-sage-500 hover:text-sage-700"
          >
            Change
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6">
        {SUBCATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === cat.key ? 'bg-sage-600 text-white shadow-sm' : 'text-sage-600 hover:bg-sage-50'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="space-y-4">
        {filtered.map((drink) => (
          <div key={drink.id} className="bg-white rounded-2xl p-5 shadow-sm border border-sage-50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-3xl">{drink.emoji}</span>
                <div>
                  <h2 className="font-semibold">{drink.name}</h2>
                  <p className="text-sage-600 text-sm mt-0.5">{drink.description}</p>
                  <p className="font-display text-lg text-sage-700 mt-2">{formatPrice(drink.price)}</p>
                </div>
              </div>
            </div>

            {/* Variant selectors */}
            {drink.variants?.map((variant) => (
              <div key={variant.label} className="mt-3">
                <p className="text-xs text-sage-500 mb-1.5 font-medium">{variant.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {variant.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setVariant(drink.id, variant.label, opt)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        getVariant(drink.id, variant.label, variant.options[0]) === opt
                          ? 'bg-sage-600 text-white border-sage-600'
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
              onClick={() => handleAddDrink(drink)}
              className={`mt-4 w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                added === drink.id
                  ? 'bg-sage-500 text-white scale-95'
                  : 'bg-sage-100 text-sage-800 hover:bg-sage-200'
              }`}
            >
              {added === drink.id ? (
                <span className="flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Added to order</span>
              ) : (
                'Add to order'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Timing Modal */}
      {showTimingModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl p-6 pb-10 shadow-2xl">
            <h2 className="font-display text-2xl font-medium mb-1">When would you like your drink?</h2>
            <p className="text-sage-600 text-sm mb-6">We'll have it ready at the right time</p>
            <div className="space-y-3">
              {TIMING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => confirmTiming(opt.value as any)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-sage-100 hover:border-sage-400 hover:bg-sage-50 transition-all text-left"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-sage-600 text-sm">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
