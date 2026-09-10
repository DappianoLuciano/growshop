'use client'

import { useState, useEffect } from 'react'
import { Loader2, Package, Check, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

interface ComboProduct {
  id: string
  quantity: number
  variant: {
    stock: number
    product: {
      name: string
      brand: string | null
      images: { url: string; alt: string | null }[]
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

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const combosPerPage = 8
  const { addItem } = useCart()

  useEffect(() => {
    fetchCombos()
  }, [])

  const fetchCombos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/combos')
      if (response.ok) {
        const data = await response.json()
        setCombos(data)
      }
    } catch (error) {
      console.error('Error al cargar combos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | string) => {
    const numPrice = Math.floor(parseFloat(price.toString()))
    return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const calculateAvailability = (products: ComboProduct[]) => {
    if (!products || products.length === 0) return 0

    const availablePerProduct = products.map(cp => {
      if (cp.variant.stock === 0) return 0
      return Math.floor(cp.variant.stock / cp.quantity)
    })

    return Math.min(...availablePerProduct)
  }

  const handleAddToCart = (e: React.MouseEvent, combo: Combo) => {
    e.preventDefault()
    e.stopPropagation()

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
  }

  // Paginación
  const totalPages = Math.ceil(combos.length / combosPerPage)
  const indexOfLastCombo = currentPage * combosPerPage
  const indexOfFirstCombo = indexOfLastCombo - combosPerPage
  const currentCombos = combos.slice(indexOfFirstCombo, indexOfLastCombo)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-20">
      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-6">
            COMBOS
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Aprovechá nuestros paquetes especiales con todo lo que necesitás
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
            <p className="text-gray-400">Cargando combos...</p>
          </div>
        ) : combos.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24">
            <Package className="w-24 h-24 text-gray-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No hay combos disponibles</h2>
            <p className="text-gray-400 text-center max-w-md">
              Pronto tendremos combos especiales para vos
            </p>
          </div>
        ) : (
          <>
          {/* Combos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4">
            {currentCombos.map((combo) => {
              const available = calculateAvailability(combo.products)
              return (
                <Link
                  key={combo.id}
                  href={`/combos/${combo.slug}`}
                  className="group relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all hover:scale-105 hover:border-green-500/60"
                >
                  {/* Badge COMBO */}
                  <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    COMBO
                  </div>

                  {/* Imagen */}
                  <div className="relative aspect-square bg-gray-800">
                    {combo.image ? (
                      <Image
                        src={combo.image}
                        alt={combo.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-700" />
                      </div>
                    )}
                    {available === 0 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Sin Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base font-bold mb-1.5 line-clamp-2 transition-colors text-white group-hover:text-green-400">
                      {combo.name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-2">
                      {combo.products.length} producto{combo.products.length !== 1 ? 's' : ''}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-green-400">
                        ${formatPrice(combo.price)}
                      </span>
                      <button
                        onClick={(e) => handleAddToCart(e, combo)}
                        disabled={available === 0}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info de página */}
              <p className="text-gray-400 text-sm">
                Página <span className="text-white font-semibold">{currentPage}</span> de <span className="text-white font-semibold">{totalPages}</span>
              </p>

              {/* Botones de navegación */}
              <div className="flex items-center gap-2">
                {/* Botón Anterior */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Números de página */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-12 h-12 md:w-10 md:h-10 rounded-lg transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold'
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-gray-500 px-2">...</span>
                    }
                    return null
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  )
}
