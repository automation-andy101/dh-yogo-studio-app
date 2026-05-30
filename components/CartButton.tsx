'use client'
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCart } from './CartContext'
import { formatPrice } from '@/lib/products'
import Link from 'next/link'

export default function CartButton() {
  const { state, dispatch, total, itemCount } = useCart()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-charcoal text-white px-5 py-3 rounded-full shadow-xl hover:bg-sage-700 transition-colors duration-200"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-body text-sm font-medium">{formatPrice(total)}</span>
        {itemCount > 0 && (
          <span className="bg-clay-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-cream w-full max-w-sm h-full flex flex-col shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-sage-100">
              <h2 className="font-display text-2xl font-medium">Your Order</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-sage-50 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {state.items.length === 0 ? (
                <p className="text-center text-sage-600 py-12 font-body text-sm">Your cart is empty</p>
              ) : (
                state.items.map((item) => {
                  const key = item.id + JSON.stringify(item.options || {})
                  return (
                    <div key={key} className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                      {item.emoji && <span className="text-2xl mt-0.5">{item.emoji}</span>}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">{item.name}</p>
                        {item.options && Object.keys(item.options).length > 0 && (
                          <p className="text-xs text-sage-600 mt-0.5">
                            {Object.values(item.options).join(' · ')}
                          </p>
                        )}
                        <p className="text-sage-700 font-semibold text-sm mt-1">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, quantity: item.quantity - 1, options: item.options })}
                          className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center hover:bg-sage-200 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, quantity: item.quantity + 1, options: item.options })}
                          className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center hover:bg-sage-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id, options: item.options })}
                          className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors ml-1"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="px-6 py-5 border-t border-sage-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sage-700">Total</span>
                  <span className="font-display text-2xl font-medium">{formatPrice(total)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center bg-charcoal text-white py-4 rounded-xl font-medium hover:bg-sage-800 transition-colors"
                >
                  Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
