import type { Metadata } from 'next'
import { prisma } from '@/lib/db/prisma'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        images: { orderBy: { order: 'asc' }, take: 1, select: { url: true } },
      },
    })

    if (!product) return { title: 'Producto no encontrado' }

    const description =
      product.description?.slice(0, 160) || `Comprá ${product.name} en AgroGrow. Envíos a todo el país.`
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
  } catch {
    return {}
  }
}

export default function ProductoLayout({ children }: { children: React.ReactNode }) {
  return children
}
