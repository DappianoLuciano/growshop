import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import WhatsAppButton from '@/components/store/WhatsAppButton'
import { CartProvider } from '@/contexts/CartContext'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="bg-black min-h-screen overflow-x-hidden">
        <Header />
        <main className="overflow-x-hidden">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </CartProvider>
  )
}
