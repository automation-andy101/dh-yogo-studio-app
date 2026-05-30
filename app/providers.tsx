'use client'
import { CartProvider } from '@/components/CartContext'
import { ThemeProvider } from '@/components/ThemeContext'
import ThemeSwitcher from '@/components/ThemeSwitcher'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>
        <ThemeSwitcher />
        {children}
      </CartProvider>
    </ThemeProvider>
  )
}
