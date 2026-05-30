'use client'
import { CheckCircle, Home, Coffee, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useCart } from '@/components/CartContext'

interface OrderDetails {
  orderNumber: string
  total: number
  items: any[]
  drinkTiming?: string
  customerName?: string
  status: string
}

const DRINK_TIMING: Record<string, string> = {
  before_class: 'Before your class',
  after_class: 'After your class',
  now: 'Right now',
}

function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { dispatch } = useCart() 

  useEffect(() => {
    // Clear cart immediately on landing on success page
    dispatch({ type: 'CLEAR' })
    localStorage.removeItem('deansgate-haus-cart')

    // Check localStorage first (in case they navigated away and came back)
    const saved = localStorage.getItem('deansgate-haus-last-order')
    if (saved) {
      try {
        setOrder(JSON.parse(saved))
        setLoading(false)
      } catch {}
    }

    // Always fetch fresh from API using session ID
    if (sessionId) {
      fetch(`/api/payments/order-by-session?session_id=${sessionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.order) {
            setOrder(data.order)
            // Save to localStorage so they can come back to it
            localStorage.setItem('deansgate-haus-last-order', JSON.stringify(data.order))
            // Clear the cart
            localStorage.removeItem('deansgate-haus-cart')
            dispatch({ type: 'CLEAR' })
          } else {
            setError(true)
          }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const hasDrinks = order?.items?.some((i) => i.category === 'drink')

  if (loading) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-3" />
          <p className="text-sage-600 text-sm">Confirming your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen blob-bg flex items-center justify-center px-5 py-12">
      <div className="max-w-sm w-full">
        {/* Success icon */}
        <div className="text-center mb-6">
          <div
            className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ animation: 'float 4s ease-in-out infinite' }}
          >
            <CheckCircle className="w-10 h-10 text-sage-600" />
          </div>
          <h1 className="font-display text-4xl font-light mb-1">Payment confirmed!</h1>
          <p className="text-sage-600 text-sm">Show this screen at the desk</p>
        </div>

        {/* Order number — the main thing staff need to see */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-sage-200 p-6 mb-4 text-center">
            <p className="text-xs text-sage-500 uppercase tracking-widest mb-2">Order Number</p>
            <p className="font-mono text-2xl font-bold text-charcoal tracking-wider">
              {order.orderNumber}
            </p>
            <p className="text-xs text-sage-400 mt-2">Staff: check this in the admin dashboard</p>
          </div>
        )}

        {/* Order summary */}
        {order && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <h2 className="font-semibold text-sm text-sage-700 mb-3">What you ordered</h2>
            <div className="space-y-2">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name}
                    {item.quantity > 1 && <span className="text-gray-400 ml-1">×{item.quantity}</span>}
                  </span>
                  <span className="font-medium">
                    £{((item.price * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-sage-100 flex justify-between font-semibold">
                <span>Total paid</span>
                <span className="text-sage-700">£{(order.total / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Drink timing */}
            {hasDrinks && order.drinkTiming && (
              <div className="mt-3 pt-3 border-t border-sage-50 flex items-center gap-2 text-sm">
                <Coffee className="w-4 h-4 text-clay-500 shrink-0" />
                <span className="text-sage-700">
                  Drink ready: <strong>{DRINK_TIMING[order.drinkTiming] || order.drinkTiming}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Fallback if no order found */}
        {!order && !loading && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 text-center">
            <p className="text-sage-600 text-sm">Payment received — please show this screen at the desk.</p>
          </div>
        )}

        {/* Keep this page accessible note */}
        <p className="text-center text-xs text-sage-500 mb-5">
          📱 Keep this page open or screenshot it — your order number is saved if you come back
        </p>

        <Link
          href="/"
          className="block w-full text-center bg-charcoal text-white px-6 py-3.5 rounded-xl font-medium hover:bg-sage-800 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
