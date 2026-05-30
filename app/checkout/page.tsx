'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/components/CartContext'
import { formatPrice } from '@/lib/products'
import { ArrowLeft, CreditCard, User } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { state, dispatch, total } = useCart()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(false)

  // Wait for localStorage to load before rendering
  useEffect(() => {
    setHydrated(true)
  }, [])

  const hasDrinks = state.items.some((i) => i.category === 'drink')

  const handleCheckout = async () => {
    if (!name || !email) { setError('Please enter your name and email'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items,
          customerName: name,
          customerEmail: email,
          drinkTiming: state.drinkTiming,
          classTime: state.classTime,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Don't render until hydrated from localStorage
  if (!hydrated) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <p className="text-sage-600 text-lg font-display">Your cart is empty</p>
        <Link href="/" className="mt-4 inline-block text-sage-700 underline text-sm">Back to home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8 pb-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sage-600 text-sm mb-6 hover:text-sage-800">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="font-display text-4xl font-light mb-6">Checkout</h1>

      {/* Order summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
        <h2 className="font-semibold mb-3 text-sm text-sage-700 uppercase tracking-wide">Order Summary</h2>
        <div className="space-y-2">
          {state.items.map((item) => (
            <div key={item.id + JSON.stringify(item.options)} className="flex justify-between items-start text-sm">
              <div>
                <span>{item.emoji} {item.name}</span>
                {item.options && Object.keys(item.options).length > 0 && (
                  <p className="text-xs text-sage-500 mt-0.5">{Object.values(item.options).join(' · ')}</p>
                )}
                {item.quantity > 1 && <span className="text-sage-500 ml-1">x{item.quantity}</span>}
              </div>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {hasDrinks && state.drinkTiming && (
          <div className="mt-3 pt-3 border-t border-sage-50 text-xs text-sage-600 flex items-center gap-1">
            🕐 Drink timing: <strong className="text-sage-700 capitalize">{state.drinkTiming.replace('_', ' ')}</strong>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-sage-100 flex justify-between font-semibold">
          <span>Total</span>
          <span className="font-display text-xl">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Customer details */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
        <h2 className="font-semibold mb-3 text-sm text-sage-700 uppercase tracking-wide flex items-center gap-2">
          <User className="w-4 h-4" /> Your Details
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-sage-200 text-sm focus:outline-none focus:border-sage-500 transition-colors"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-sage-200 text-sm focus:outline-none focus:border-sage-500 transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-charcoal text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-sage-800 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="spinner w-4 h-4" /> Processing...
          </span>
        ) : (
          <>
            <CreditCard className="w-5 h-5" /> Pay {formatPrice(total)} securely
          </>
        )}
      </button>
      <p className="text-center text-xs text-sage-500 mt-3">Secured by Stripe · SSL encrypted</p>
    </div>
  )
}