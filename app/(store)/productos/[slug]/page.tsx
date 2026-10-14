import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetail, { type Product } from '@/components/store/ProductDetail'
import { getActiveProductBySlug, getSuggestedProducts } from '@/lib/store/products'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string }>
}

// Mismo formato que devolvía /api/products/[slug] (Decimal -> string, Date -> ISO)
const toPlain = <T,>(data: unknown) => JSON.parse(JSON.stringify(data)) as T

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getActiveProductBySlug(slug)

  if (!product) return { title: 'Producto no encontrado' }

  const description =
    product.description?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) ||
    `Comprá ${product.name} en AgroGrow. Envíos a todo el país.`
  const image = product.images[0]?.url

  return {
    title: product.name,
    description,
    alternates: { canonical: `/productos/${slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/productos/${slug}`,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductoDetailPage({ params, searchParams }: Props) {
  const [{ slug }, { from }] = await Promise.all([params, searchParams])
  const product = await getActiveProductBySlug(slug)

  if (!product) notFound()

  const suggested = product.categoryId ? await getSuggestedProducts(product.id) : []

  return (
    <ProductDetail
      product={toPlain<Product>(product)}
      suggestedProducts={toPlain<Product[]>(suggested)}
      from={from}
    />
  )
}
