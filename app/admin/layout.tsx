'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/components/ThemeContext'
import { signOut } from '@/lib/auth-client'
import {
  LayoutDashboard, ShoppingBag, Coffee,
  CreditCard, BarChart2, QrCode, Menu, LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/admin',            label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/orders',     label: 'All Orders',   icon: ShoppingBag },
  { href: '/admin/drinks',     label: 'Drink Orders', icon: Coffee },
  { href: '/admin/pdq',        label: 'PDQ Payment',  icon: CreditCard },
  { href: '/admin/analytics',  label: 'Analytics',    icon: BarChart2 },
  { href: '/admin/qr',         label: 'QR Code',      icon: QrCode },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme } = useTheme()

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-100 shadow-sm flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-50">
          <Image
            src={theme === 'deansgate-dark' ? '/logo-black.jpg' : '/logo-burgundy.jpg'}
            alt="Deansgate Haus"
            width={320}
            height={140}
            className="object-contain w-72 h-auto rounded-2xl"
          />
          <p className="text-xs text-gray-400 mt-1">Staff Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-item ${pathname === href ? 'active' : 'text-gray-600'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-gray-50">
          <button
            onClick={handleSignOut}
            className="sidebar-item w-full text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
          <Image
            src="/logo-burgundy.jpg"
            alt="Deansgate Haus"
            width={120}
            height={50}
            className="object-contain h-auto"
          />
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-50">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
