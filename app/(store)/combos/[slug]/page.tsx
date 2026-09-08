'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, ShoppingCart, Loader2, Check, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

interface ComboProduct {
  id: string
  quantity: number
  variant: {
    id: string
    stock: number
    product: {
      name: string
      brand: string | null
      slug: string
      images: { url: string; alt: string | null }[]
      category: { name: string } | null
    }
  }
}

interface Combo {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  slug: string
  products: ComboProduct[]
}

export default function ComboDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { addItem } = useCart()
  const [combo, setCombo] = useState<Combo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    fetchCombo()
  }, [])

  const fetchCombo = async () => {
    try {
      const response = await fetch(`/api/combos/${resolvedParams.slug}`)
      if (response.ok) {
        const data = await response.json()
        setCombo(data)
      } else {
        setError('Combo no encontrado')
      }
    } catch (error) {
      console.error('Error al cargar combo:', error)
      setError('Error al cargar el combo')
    } finally {
      setLoading(false)
    }
  }

  const calculateAvailability = (products: ComboProduct[]) => {
    if (!products || products.length === 0) return 0

    const availablePerProduct = products.map(cp => {
      if (cp.variant.stock === 0) return 0
      return Math.floor(cp.variant.stock / cp.quantity)
    })

    return Math.min(...availablePerProduct)
  }

  const formatPrice = (price: number | string) => {
    const numPrice = Math.floor(parseFloat(price.toString()))
    return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleAddToCart = () => {
    if (!combo) return

    const available = calculateAvailability(combo.products)
    if (available === 0) return

    addItem({
      comboId: combo.id,
      comboSlug: combo.slug,
      productName: combo.name,
      price: parseFloat(combo.price.toString()),
      image: combo.image,
      maxStock: available,
      isCombo: true,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (loading) {
    return (
      <div className="relative bg-black min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-black to-black animate-gradient-shift -z-10"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            <span className="text-gray-400">Cargando combo...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !combo) {
    return (
      <div className="relative bg-black min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-black to-black animate-gradient-shift -z-10"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
            <Link href="/combos" className="text-green-400 hover:text-green-300">
              Volver a combos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const available = calculateAvailability(combo.products)

  return (
    <div className="relative bg-black min-h-screen">
      {/* Efectos de fondo */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-black to-black animate-gradient-shift -z-10"></div>
      <div className="fixed inset-0 opacity-20 -z-10">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
      </div>

      <div className="relative z-10 pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/combos"
            className="inline-flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Combos
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Imagen del combo */}
            <div className="space-y-3">
              <div className="relative">
                <div className="aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                  {combo.image ? (
                    <Image
                      src={combo.image}
                      alt={combo.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-24 h-24 text-gray-700" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info del combo */}
            <div className="flex flex-col">
              {/* Badge */}
              <div className="mb-2">
                <span className="text-xs text-green-400 font-semibold">
                  COMBO ESPECIAL
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
                {combo.name}
              </h1>

              {combo.description && (
                <div
                  className="text-sm text-gray-300 mb-4 leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: combo.description }}
                />
              )}

              {/* Precio */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-black text-green-400">
                    ${formatPrice(combo.price)}
                  </span>
                </div>

                {available > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400 font-semibold">
                      {available < 10 ? `Solo ${available} disponibles` : 'En stock'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-400 font-semibold">Sin stock</span>
                  </div>
                )}
              </div>

              {/* Botón de compra */}
              <button
                onClick={handleAddToCart}
                disabled={available === 0 || addedToCart}
                className="flex items-center justify-center gap-2 w-full py-3 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {available === 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </>
                )}
              </button>

              {/* Productos incluidos */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Productos Incluidos
                </h3>
                <div className="space-y-2">
                  {combo.products.map((cp) => (
                    <Link
                      key={cp.id}
                      href={`/productos/${cp.variant.product.slug}`}
                      className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-green-500/50 transition-colors group"
                    >
                      <div className="relative w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {cp.variant.product.images[0] ? (
                          <Image
                            src={cp.variant.product.images[0].url}
                            alt={cp.variant.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-semibold group-hover:text-green-400 transition-colors truncate">
                          {cp.variant.product.name}
                        </p>
                        {cp.variant.product.brand && (
                          <p className="text-xs text-gray-400 truncate">
                            {cp.variant.product.brand}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-green-400 font-semibold">
                          x{cp.quantity}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
