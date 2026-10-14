import type { Metadata } from 'next'
import CombosClient, { type Combo } from './CombosClient'
import { listCombos } from '@/lib/store/products'
import { toPlain } from '@/lib/store/serialize'

// Precios y stock tienen que estar siempre al día
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Combos',
  description: 'Combos de productos para cultivo a precio especial. Envíos a todo el país.',
  alternates: { canonical: '/combos' },
}

export default async function CombosPage() {
  const combos = await listCombos()

  return <CombosClient combos={toPlain<Combo[]>(combos)} />
}
