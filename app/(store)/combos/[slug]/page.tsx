import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ComboDetail, { type Combo, type SuggestedProduct } from '@/components/store/ComboDetail'
import { getActiveComboBySlug, getSuggestedProducts } from '@/lib/store/products'
import { toPlain, toMetaDescription } from '@/lib/store/serialize'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const combo = await getActiveComboBySlug(slug)

  if (!combo) return { title: 'Combo no encontrado' }

  const description =
    toMetaDescription(combo.description) || `Comprá el combo ${combo.name} en AgroGrow. Envíos a todo el país.`

  return {
    title: combo.name,
    description,
    alternates: { canonical: `/combos/${slug}` },
    openGraph: {
      title: combo.name,
      description,
      url: `/combos/${slug}`,
      images: combo.image ? [combo.image] : undefined,
    },
  }
}

export default async function ComboDetailPage({ params }: Props) {
  const { slug } = await params
  const combo = await getActiveComboBySlug(slug)

  if (!combo) notFound()

  const suggested = await getSuggestedProducts()

  return (
    <ComboDetail
      combo={toPlain<Combo>(combo)}
      suggestedProducts={toPlain<SuggestedProduct[]>(suggested)}
    />
  )
}
