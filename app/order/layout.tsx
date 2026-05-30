import CartButton from '@/components/CartButton'

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="min-h-screen blob-bg">
        {children}
        <CartButton />
      </div>
  )
}
