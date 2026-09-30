import type { Metadata } from 'next'
import { prisma } from '@/lib/db/prisma'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    const combo = await prisma.combo.findUnique({
      where: { slug },
      select: { name: true, description: true, image: true },
    })

    if (!combo) return { title: 'Combo no encontrado' }

    const description =
      combo.description?.slice(0, 160) || `Comprá el combo ${combo.name} en AgroGrow. Envíos a todo el país.`

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
  } catch {
    return {}
  }
}

export default function ComboLayout({ children }: { children: React.ReactNode }) {
  return children
}
