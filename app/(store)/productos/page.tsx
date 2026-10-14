import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProductosClient, { type Product } from './ProductosClient'
import { listCategories, listProducts } from '@/lib/store/products'
import { toPlain } from '@/lib/store/serialize'

export const metadata: Metadata = {
  title: 'Productos para cultivo',
  description: 'Fertilizantes, sustratos, iluminación, macetas y todo lo que necesitás para tu cultivo indoor y outdoor. Envíos a todo el país.',
  alternates: { canonical: '/productos' },
}

type Props = { searchParams: Promise<{ categoria?: string; busqueda?: string }> }

export default async function ProductosPage({ searchParams }: Props) {
  const { categoria, busqueda } = await searchParams
  const [products, categories] = await Promise.all([
    listProducts({ section: 'GROW', categoryId: categoria, search: busqueda }),
    listCategories('GROW'),
  ])

  return (
    // useSearchParams en el cliente necesita un Suspense
    <Suspense>
      <ProductosClient
        initialProducts={toPlain<Product[]>(products)}
        categories={categories.map(({ id, name }) => ({ id, name }))}
      />
    </Suspense>
  )
}
