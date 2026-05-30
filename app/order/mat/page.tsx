'use client'
import { PRODUCTS, formatPrice } from '@/lib/products'
import { useCart } from '@/components/CartContext'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function MatHirePage() {
  const { dispatch } = useCart()
  const [added, setAdded] = useState<string | null>(null)

  const handleAdd = (mat: (typeof PRODUCTS.matHire)[0]) => {
    dispatch({
      type: 'ADD_ITEM',
      item: { id: mat.id, name: mat.name, price: mat.price, quantity: 1, category: 'mat_hire', emoji: mat.emoji },
    })
    setAdded(mat.id)
    setTimeout(() => setAdded(null), 1500)
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sage-600 text-sm mb-6 hover:text-sage-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="font-display text-4xl font-light mb-1">Mat Hire</h1>
      <p className="text-sage-600 text-sm mb-8">Fresh, sanitised mats ready for your practice</p>

      <div className="space-y-4">
        {PRODUCTS.matHire.map((mat) => (
          <div
            key={mat.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-sage-50 flex items-center gap-4 card-hover"
          >
            <span className="text-4xl">{mat.emoji}</span>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{mat.name}</h2>
              <p className="text-sage-600 text-sm mt-0.5">{mat.description}</p>
              <p className="font-display text-xl text-sage-700 mt-2">{formatPrice(mat.price)}</p>
            </div>
            <button
              onClick={() => handleAdd(mat)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-w-[90px] ${
                added === mat.id
                  ? 'bg-sage-500 text-white scale-95'
                  : 'bg-sage-100 text-sage-800 hover:bg-sage-200'
              }`}
            >
              {added === mat.id ? (
                <span className="flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Added</span>
              ) : (
                'Add'
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-sage-50 rounded-xl p-4 text-sm text-sage-700">
        <p className="font-medium mb-1">🧼 Hygiene guarantee</p>
        <p className="text-sage-600">All mats are cleaned and sanitised between every use.</p>
      </div>
    </div>
  )
}
