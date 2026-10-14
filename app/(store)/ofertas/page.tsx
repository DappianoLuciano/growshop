import type { Metadata } from 'next'
import OfertasClient, { type Product } from './OfertasClient'
import { listCategories, listOfferProducts } from '@/lib/store/products'
import { toPlain } from '@/lib/store/serialize'

// Precios y stock tienen que estar siempre al día
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ofertas',
  description: 'Productos para cultivo y accesorios con descuento. Envíos a todo el país.',
  alternates: { canonical: '/ofertas' },
}

export default async function OfertasPage() {
  const [products, categories] = await Promise.all([listOfferProducts(), listCategories()])

  return (
    <OfertasClient
      initialProducts={toPlain<Product[]>(products)}
      categories={categories.map(({ id, name }) => ({ id, name }))}
    />
  )
}
