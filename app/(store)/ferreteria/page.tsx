import type { Metadata } from 'next'
import { Suspense } from 'react'
import FerreteriaClient, { type Product } from './FerreteriaClient'
import { listCategories, listProducts } from '@/lib/store/products'
import { toPlain } from '@/lib/store/serialize'

export const metadata: Metadata = {
  title: 'Ferretería',
  description: 'Herramientas y artículos de ferretería para tu cultivo. Envíos a todo el país.',
  alternates: { canonical: '/ferreteria' },
}

type Props = { searchParams: Promise<{ categoria?: string }> }

export default async function FerreteriaPage({ searchParams }: Props) {
  const { categoria } = await searchParams
  const [products, categories] = await Promise.all([
    listProducts({ section: 'FERRETERIA', categoryId: categoria }),
    listCategories('FERRETERIA'),
  ])

  return (
    // useSearchParams en el cliente necesita un Suspense
    <Suspense>
      <FerreteriaClient
        initialProducts={toPlain<Product[]>(products)}
        categories={categories.map(({ id, name }) => ({ id, name }))}
      />
    </Suspense>
  )
}
