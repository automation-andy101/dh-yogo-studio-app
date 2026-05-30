'use client'
import { PRODUCTS, formatPrice } from '@/lib/products'
import { useCart } from '@/components/CartContext'
import { ArrowLeft, Check, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ClassesPage() {
  const { dispatch } = useCart()
  const [added, setAdded] = useState<string | null>(null)

  const handleAdd = (item: any) => {
    dispatch({
      type: 'ADD_ITEM',
      item: { id: item.id, name: item.name, price: item.price, quantity: 1, category: item.category, emoji: item.emoji },
    })
    setAdded(item.id)
    setTimeout(() => setAdded(null), 1500)
  }

  const badges: Record<string, { label: string; color: string }> = {
    'class-pack-10': { label: 'Most Popular', color: 'bg-clay-100 text-clay-700' },
    'membership-monthly': { label: 'Best Value', color: 'bg-sage-100 text-sage-700' },
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8 pb-28">
      <Link href="/" className="inline-flex items-center gap-2 text-sage-600 text-sm mb-6 hover:text-sage-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="font-display text-4xl font-light mb-1">Classes</h1>
      <p className="text-sage-600 text-sm mb-8">Choose how you want to practice</p>

      {/* Single Class */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-sage-500 uppercase tracking-widest mb-3">Drop-in</h2>
        {PRODUCTS.classes.filter(c => c.category === 'class').map((item) => (
          <ClassCard key={item.id} item={item} badge={badges[item.id]} onAdd={handleAdd} added={added === item.id} />
        ))}
      </section>

      {/* Class Packs */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-sage-500 uppercase tracking-widest mb-3">Class Packs</h2>
        <div className="space-y-3">
          {PRODUCTS.classes.filter(c => c.category === 'class_pack').map((item) => (
            <ClassCard key={item.id} item={item} badge={badges[item.id]} onAdd={handleAdd} added={added === item.id} />
          ))}
        </div>
      </section>

      {/* Memberships */}
      <section>
        <h2 className="text-xs font-semibold text-sage-500 uppercase tracking-widest mb-3">Memberships</h2>
        <div className="space-y-3">
          {PRODUCTS.classes.filter(c => c.category === 'membership').map((item) => (
            <ClassCard key={item.id} item={item} badge={badges[item.id]} onAdd={handleAdd} added={added === item.id} highlight />
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-sage-500 text-center">Class packs valid for 12 months · Memberships auto-renew monthly</p>
    </div>
  )
}

function ClassCard({ item, badge, onAdd, added, highlight }: any) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4 card-hover ${highlight ? 'border-sage-300' : 'border-sage-50'}`}>
      <span className="text-3xl">{item.emoji}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{item.name}</h3>
          {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>{badge.label}</span>}
        </div>
        <p className="text-sage-600 text-sm mt-0.5">{item.description}</p>
        <p className="font-display text-xl text-sage-700 mt-1.5">{formatPrice(item.price)}</p>
      </div>
      <button
        onClick={() => onAdd(item)}
        className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-w-[80px] ${
          added
            ? 'bg-sage-500 text-white scale-95'
            : highlight
            ? 'bg-sage-600 text-white hover:bg-sage-700'
            : 'bg-sage-100 text-sage-800 hover:bg-sage-200'
        }`}
      >
        {added ? <Check className="w-4 h-4 mx-auto" /> : 'Add'}
      </button>
    </div>
  )
}
