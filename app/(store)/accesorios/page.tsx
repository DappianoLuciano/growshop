import type { Metadata } from 'next'
import { Suspense } from 'react'
import AccesoriosClient, { type Product } from './AccesoriosClient'
import { listCategories, listProducts } from '@/lib/store/products'
import { toPlain } from '@/lib/store/serialize'

export const metadata: Metadata = {
  title: 'Accesorios',
  description: 'Picadores, bandejas, encendedores, ceniceros y más accesorios. Envíos a todo el país.',
  alternates: { canonical: '/accesorios' },
}

type Props = { searchParams: Promise<{ categoria?: string }> }

export default async function AccesoriosPage({ searchParams }: Props) {
  const { categoria } = await searchParams
  const [products, categories] = await Promise.all([
    listProducts({ section: 'ACCESORIOS', categoryId: categoria }),
    listCategories('ACCESORIOS'),
  ])

  return (
    // useSearchParams en el cliente necesita un Suspense
    <Suspense>
      <AccesoriosClient
        initialProducts={toPlain<Product[]>(products)}
        categories={categories.map(({ id, name }) => ({ id, name }))}
      />
    </Suspense>
  )
}
