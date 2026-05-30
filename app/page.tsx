'use client'
import Link from 'next/link'
import Image from 'next/image'

import { ShoppingBag, Coffee, Shirt, Leaf } from 'lucide-react'
import { useTheme } from '@/components/ThemeContext'

export default function Home() {
  const { theme } = useTheme()
  const isDark = theme === 'deansgate-dark'
  const isDeansgate = theme.startsWith('deansgate')

  const tiles = [
    { href: '/order/mat',     icon: <Leaf className="w-8 h-8" />,        title: 'Hire a Mat',    desc: 'Standard & premium mats',         delay: '0ms' },
    { href: '/order/drinks',  icon: <Coffee className="w-8 h-8" />,      title: 'Order a Drink', desc: 'Coffee, smoothies & juices',       delay: '80ms' },
    { href: '/shop',          icon: <Shirt className="w-8 h-8" />,       title: 'Shop',          desc: 'Socks, hoodies, mats & more',      delay: '160ms' },
    { href: '/order/classes', icon: <ShoppingBag className="w-8 h-8" />, title: 'Classes',       desc: 'Single, packs & memberships',      delay: '240ms' },
  ]

  return (
    <main className="min-h-screen blob-bg flex flex-col">
      {/* Header */}
      <header className="pt-14 pb-6 px-6 text-center">
        <div
          className="flex items-center justify-center mb-5"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        >
          <Image
            src={theme === 'deansgate-dark' ? '/logo-black.jpg' : '/logo-burgundy.jpg'}
            alt="Deansgate Haus"
            width={320}
            height={140}
            className="object-contain w-72 h-auto rounded-2xl"
          />
        </div>
        <p
          className="text-sm mt-3 tracking-wide"
          style={{ color: 'var(--text-subtle)', animation: 'fadeIn 0.8s ease-out 0.4s forwards', opacity: 0 }}
        >
          What can we do for you today?
        </p>
      </header>

      {/* Tiles */}
      <section className="flex-1 px-5 pb-16 max-w-md mx-auto w-full">
        <div className="grid grid-cols-2 gap-4">
          {tiles.map((tile, i) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group relative overflow-hidden rounded-2xl shadow-md card-hover"
              style={{
                animation: `slideUp 0.5s ease-out ${tile.delay} forwards`,
                opacity: 0,
                borderRadius: 'var(--radius)',
              }}
            >
              <div
                className="p-6 h-full min-h-[160px] flex flex-col justify-between"
                style={{
                  background: i % 2 === 0
                    ? `linear-gradient(135deg, var(--primary), var(--primary-dark))`
                    : `linear-gradient(135deg, var(--primary-light), var(--primary))`,
                }}
              >
                <div style={{ color: isDark ? 'var(--bg)' : 'rgba(255,255,255,0.9)' }}>
                  {tile.icon}
                </div>
                <div>
                  <h2 className="font-semibold text-lg leading-tight" style={{ color: isDark ? 'var(--bg)' : '#fff' }}>
                    {tile.title}
                  </h2>
                  <p className="text-xs mt-1 leading-snug" style={{ color: isDark ? 'rgba(250,247,242,0.7)' : 'rgba(255,255,255,0.75)' }}>
                    {tile.desc}
                  </p>
                </div>
                <div className="absolute top-3 right-3 w-20 h-20 rounded-full bg-white/10 -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
