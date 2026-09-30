'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import ProductImageCarousel from '@/components/store/ProductImageCarousel'
import { useCart } from '@/contexts/CartContext'

interface Product {
  id: string
  name: string
  brand: string | null
  slug: string
  price: number
  salePrice: number | null
  images: { url: string; alt: string | null }[]
  variants: {
    id: string
    price: number | null
    stock: number
    sku: string | null
    capacity: string | null
    size: string | null
    power: string | null
  }[]
  category: {
    id: string
    name: string
    slug: string
    imageFit?: 'COVER' | 'CONTAIN'
  } | null
}

export default function OfertasPage() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('default')
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 8

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/admin/categories')
        if (response.ok) setCategories(await response.json())
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      }
    }
    fetchCategories()
  }, [])

  // Al cambiar de categoría: volver a la página 1 y mostrar la carga
  const [prevCategory, setPrevCategory] = useState(selectedCategory)
  if (selectedCategory !== prevCategory) {
    setPrevCategory(selectedCategory)
    setCurrentPage(1)
    setLoading(true)
  }

  useEffect(() => {
    let cancelled = false
    async function fetchOffers() {
      try {
        const params = new URLSearchParams()
        if (selectedCategory) params.append('categoria', selectedCategory)

        const url = params.toString()
          ? `/api/products/offers?${params.toString()}`
          : '/api/products/offers'

        const response = await fetch(url)
        if (response.ok && !cancelled) setProducts(await response.json())
      } catch (error) {
        console.error('Error al cargar ofertas:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOffers()
    return () => { cancelled = true }
  }, [selectedCategory])

  const getProductPrice = (product: Product) => {
    return product.salePrice || product.price
  }

  const getTotalStock = (product: Product) => {
    return product.variants.reduce((total, v) => total + v.stock, 0)
  }

  const getDiscount = (product: Product) => {
    if (!product.salePrice) return 0
    return Math.round(((parseFloat(product.price.toString()) - parseFloat(product.salePrice.toString())) / parseFloat(product.price.toString())) * 100)
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()

    const variant = product.variants[0]
    if (!variant || variant.stock === 0) return

    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      productBrand: product.brand,
      productSlug: product.slug,
      variantSku: variant.sku,
      size: variant.size,
      capacity: variant.capacity,
      power: variant.power,
      price: parseFloat(getProductPrice(product).toString()),
      image: product.images[0]?.url || null,
      maxStock: variant.stock,
    })
  }

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return parseFloat(getProductPrice(a).toString()) - parseFloat(getProductPrice(b).toString())
      case 'price-desc':
        return parseFloat(getProductPrice(b).toString()) - parseFloat(getProductPrice(a).toString())
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'discount':
        return getDiscount(b) - getDiscount(a)
      default:
        return 0
    }
  })

  // Paginación
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage)
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative bg-black min-h-screen">
      {/* Efectos de fondo */}
      <div className="fixed inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-black animate-gradient-shift -z-10"></div>
      <div className="fixed inset-0 opacity-20 -z-10">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
      </div>

      {/* Contenido */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black">
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full">
                OFERTAS ESPECIALES
              </div>
            </h1>
          </div>

          {/* Filtros Mobile - Dropdowns */}
          <div className="md:hidden flex gap-2 mb-4">
            {/* Dropdown Categorías */}
            <div className="flex-1">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full px-3 py-2.5 bg-gray-900/50 border border-yellow-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23eab308'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25rem',
                  paddingRight: '2rem'
                }}
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Ordenar */}
            <div className="flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-900/50 border border-yellow-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23eab308'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25rem',
                  paddingRight: '2rem'
                }}
              >
                <option value="default">Ordenar por</option>
                <option value="discount">Mayor descuento</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
              </select>
            </div>
          </div>

          {/* Layout con Sidebar */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar de filtros - Solo Desktop */}
            <aside className="hidden md:block md:w-64">
              <div className="bg-gray-900/50 border border-yellow-500/20 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                <h2 className="text-lg font-bold text-white mb-4">Categorías</h2>
                <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-gray-800">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                        selectedCategory === null
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      Todas
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                    <span className="text-gray-400">Cargando ofertas...</span>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                      <Search className="w-12 h-12 text-yellow-500/50" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedCategory ? 'No hay ofertas en esta categoría' : 'Sin ofertas activas'}
                    </h3>
                    <p className="text-gray-400 max-w-md">
                      {selectedCategory
                        ? 'No hay productos en oferta en esta categoría. Probá con otra categoría o volvé a todas.'
                        : 'Por el momento no hay ofertas disponibles. Seguí visitando esta sección para no perderte las promociones.'
                      }
                    </p>
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
                      >
                        Ver todas las ofertas
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Header del grid */}
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">{sortedProducts.length}</span> productos en oferta
                    </p>

                    {/* Selector de ordenar - Solo Desktop */}
                    <div className="hidden md:block">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2.5 bg-gray-900/50 border border-yellow-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer hover:border-yellow-500/50"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23eab308'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1.25rem',
                          paddingRight: '2.5rem'
                        }}
                      >
                        <option value="default">Ordenar por</option>
                        <option value="discount">Mayor descuento</option>
                        <option value="price-asc">Precio: Menor a Mayor</option>
                        <option value="price-desc">Precio: Mayor a Menor</option>
                        <option value="name-asc">Nombre: A-Z</option>
                        <option value="name-desc">Nombre: Z-A</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4">
                    {currentProducts.map((product) => {
                      const discount = getDiscount(product)
                      return (
                    <Link
                      key={product.id}
                      href={`/productos/${product.slug}?from=ofertas`}
                      className="group relative bg-gray-900 border border-yellow-500/30 rounded-lg overflow-hidden hover:border-yellow-500/60 transition-all hover:scale-105"
                    >
                      {/* Badge de descuento */}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                          -{discount}%
                        </div>
                      )}

                      {/* Carrusel de imágenes */}
                      <div className="relative aspect-square bg-gray-800">
                        <ProductImageCarousel
                          images={product.images}
                          productName={product.name}
                          compact={true}
                          imageFit={product.category?.imageFit}
                        />
                        {getTotalStock(product) === 0 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Sin Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 sm:p-4">
                        {product.brand && (
                          <p className="text-sm text-gray-400 mb-1">{product.brand}</p>
                        )}
                        <h3 className="text-base font-bold mb-1.5 line-clamp-2 group-hover:text-yellow-400 transition-colors text-white">
                          {product.name}
                        </h3>

                        {product.category && (
                          <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                        )}

                        <div className="space-y-1">
                          {/* Precio anterior tachado */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base text-gray-400 line-through">
                              ${parseFloat(product.price.toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </span>
                          </div>

                          {/* Precio de oferta */}
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                            <span className="text-lg sm:text-2xl font-black whitespace-nowrap text-yellow-400">
                              ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </span>
                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={getTotalStock(product) === 0}
                              className="p-1.5 sm:p-2 shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="w-5 h-5" />
                            </button>
                          </div>
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
                                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold'
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
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
