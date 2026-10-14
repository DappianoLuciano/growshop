import type { Metadata } from 'next'
import HomeClient, { type Category, type LatestProduct } from './HomeClient'
import { listCategories, listFeaturedProducts, listOfferProducts } from '@/lib/store/products'
import { toPlain } from '@/lib/store/serialize'

// Precios y stock tienen que estar siempre al día
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [featured, categories, offers] = await Promise.all([
    listFeaturedProducts(),
    listCategories('GROW'),
    listOfferProducts(),
  ])

  return (
    <HomeClient
      featured={toPlain<LatestProduct[]>(featured)}
      categories={toPlain<Category[]>(categories)}
      offers={toPlain<LatestProduct[]>(offers.slice(0, 4))}
    />
  )
}
