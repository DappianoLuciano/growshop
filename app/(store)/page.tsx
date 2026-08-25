'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'

// Valores fijos para las partículas (evita problemas de hidratación)
const particles = [
  { left: 10, top: 20, delay: 0, duration: 5 },
  { left: 25, top: 70, delay: 1, duration: 6 },
  { left: 40, top: 15, delay: 2, duration: 4 },
  { left: 55, top: 80, delay: 0.5, duration: 5.5 },
  { left: 70, top: 35, delay: 1.5, duration: 4.5 },
  { left: 15, top: 90, delay: 2.5, duration: 6 },
  { left: 85, top: 25, delay: 0.8, duration: 5.2 },
  { left: 30, top: 55, delay: 1.8, duration: 4.8 },
  { left: 60, top: 10, delay: 2.2, duration: 5.8 },
  { left: 75, top: 65, delay: 0.3, duration: 4.3 },
  { left: 20, top: 45, delay: 1.2, duration: 6.2 },
  { left: 90, top: 75, delay: 2.8, duration: 5.5 },
  { left: 35, top: 30, delay: 0.6, duration: 4.6 },
  { left: 50, top: 85, delay: 1.6, duration: 5.3 },
  { left: 65, top: 40, delay: 2.4, duration: 4.4 },
  { left: 80, top: 60, delay: 0.9, duration: 6.1 },
  { left: 5, top: 50, delay: 1.4, duration: 5.7 },
  { left: 45, top: 95, delay: 2.6, duration: 4.9 },
  { left: 95, top: 5, delay: 0.4, duration: 5.4 },
  { left: 12, top: 78, delay: 1.9, duration: 4.7 },
]

export default function HomePage() {

  return (
    <div className="relative bg-black overflow-hidden min-h-screen">
      {/* Efectos de fondo GLOBALES para toda la página */}
      {/* Gradiente animado de fondo */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-black to-black animate-gradient-shift -z-10"></div>

      {/* Grid animado */}
      <div className="fixed inset-0 opacity-20 -z-10">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
      </div>

      {/* Partículas flotantes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-8 md:pb-16 flex items-center justify-center overflow-hidden z-10">

        {/* Contenido */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="mb-8 inline-block">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500">
              AGRO.GROW
            </h1>
          </div>

          <p className="text-lg md:text-xl text-green-400 mb-8 max-w-3xl mx-auto animate-fadeIn-delayed">
            EL RINCON DEL CULTIVADOR
          </p>

          <div className="flex justify-center items-center animate-fadeIn-delayed-2">
            <Link
              href="/productos"
              className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-110"
            >
              <span className="relative z-10">Explorar Productos</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="relative py-8 md:py-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Productos Destacados
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              Los más elegidos por nuestros cultivadores
            </p>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Categorías con Carrusel */}
      <section className="relative py-8 md:py-20 z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-12 text-center">
            Categorías Principales
          </h2>
          <CategoryCarousel />
        </div>
      </section>

      {/* Últimos Productos */}
      <section className="relative py-8 md:py-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
            Últimos Productos
          </h2>
          <LatestProducts />
        </div>
      </section>

      {/* Features simples */}
      <section className="py-8 md:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <FeatureCard
              title="Envíos a Todo el País"
              description="Llega a cualquier parte de Argentina"
            />
            <FeatureCard
              title="Pagos Seguros"
              description="Mercado Pago, transferencia o efectivo"
            />
            <FeatureCard
              title="Asesoramiento"
              description="Te ayudamos a elegir lo mejor para tu cultivo"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

// Gradientes por slug de categoría
const categoryGradients: { [key: string]: string } = {
  'fertilizantes': 'from-blue-500 to-blue-600',
  'iluminacion': 'from-yellow-500 to-orange-500',
  'sustratos': 'from-green-600 to-green-700',
  'macetas': 'from-amber-600 to-amber-700',
  'ventilacion': 'from-cyan-500 to-cyan-600',
  'medicion': 'from-purple-500 to-purple-600',
}

const categoryDescriptions: { [key: string]: string } = {
  'fertilizantes': 'Nutrición para todas las etapas',
  'iluminacion': 'Tecnología LED de punta',
  'sustratos': 'Medios de cultivo premium',
  'macetas': 'Contenedores profesionales',
  'ventilacion': 'Control de clima óptimo',
  'medicion': 'Equipos de precisión',
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
}

function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)
  const cardsPerView = 3
  const mobileCardsPerView = 4

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + cardsPerView >= categories.length ? 0 : prev + cardsPerView))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - cardsPerView < 0 ? Math.max(0, categories.length - cardsPerView) : prev - cardsPerView))
  }

  const nextMobileSlide = () => {
    setMobileIndex((prev) => (prev + mobileCardsPerView >= categories.length ? 0 : prev + mobileCardsPerView))
  }

  const prevMobileSlide = () => {
    setMobileIndex((prev) => (prev - mobileCardsPerView < 0 ? Math.max(0, categories.length - mobileCardsPerView) : prev - mobileCardsPerView))
  }

  const visibleCategories = categories.slice(currentIndex, currentIndex + cardsPerView)
  const visibleMobileCategories = categories.slice(mobileIndex, mobileIndex + mobileCardsPerView)

  if (categories.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        Cargando categorías...
      </div>
    )
  }

  return (
    <>
      {/* Mobile: Carrusel con 4 categorías (2x2) */}
      <div className="md:hidden relative">
        {/* Carrusel Mobile */}
        <div className="grid grid-cols-2 gap-3 px-2">
          {visibleMobileCategories.map((category) => (
            <FlipCard
              key={category.id}
              id={category.id}
              title={category.name}
              description={category.description || categoryDescriptions[category.slug] || ''}
              color={category.color || '#10b981'}
            />
          ))}
        </div>

        {/* Controles Mobile */}
        {categories.length > mobileCardsPerView && (
          <>
            {/* Botones de navegación */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prevMobileSlide}
                className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={mobileIndex === 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Indicadores */}
              <div className="flex gap-2">
                {Array.from({ length: Math.ceil(categories.length / mobileCardsPerView) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMobileIndex(idx * mobileCardsPerView)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      Math.floor(mobileIndex / mobileCardsPerView) === idx
                        ? 'bg-green-500 w-6'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextMobileSlide}
                className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={mobileIndex + mobileCardsPerView >= categories.length}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Desktop: Carrusel */}
      <div className="hidden md:block relative">
        {/* Botón Anterior */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Carrusel */}
        <div className="grid grid-cols-3 gap-8 px-12">
          {visibleCategories.map((category, idx) => (
            <FlipCard
              key={category.id}
              id={category.id}
              title={category.name}
              description={category.description || categoryDescriptions[category.slug] || ''}
              color={category.color || '#10b981'}
            />
          ))}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex + cardsPerView >= categories.length}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicadores */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(categories.length / cardsPerView) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * cardsPerView)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentIndex / cardsPerView) === idx
                  ? 'bg-green-500 w-8'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function FlipCard({
  id,
  title,
  description,
  color
}: {
  id: string
  title: string
  description: string
  color: string
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <>
      {/* Mobile: Card simple sin flip */}
      <Link
        href={`/productos?categoria=${id}`}
        className="md:hidden h-40 rounded-xl p-4 shadow-lg border border-gray-700 flex items-center justify-center transition-all"
        style={{
          background: `linear-gradient(to bottom right, ${color}, ${color}dd)`
        }}
      >
        <h3 className="text-lg font-black text-white text-center">{title}</h3>
      </Link>

      {/* Desktop: Flip card */}
      <div
        className="hidden md:block h-56 cursor-pointer perspective-1000"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div
          className={`relative w-full h-full transition-all duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-2xl border border-gray-700 flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-black text-white">{title}</h3>
          </div>

          {/* Back */}
          <div
            className="absolute w-full h-full backface-hidden rounded-xl p-6 shadow-2xl rotate-y-180 flex flex-col items-center justify-center text-center"
            style={{
              background: `linear-gradient(to bottom right, ${color}, ${color}dd)`
            }}
          >
            <h3 className="text-2xl font-black text-white mb-4">{title}</h3>
            <p className="text-white/90 text-sm leading-relaxed mb-4">{description}</p>
            <Link
              href={`/productos?categoria=${id}`}
              className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:scale-110 transition-transform duration-300 shadow-xl"
            >
              Explorar
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

interface LatestProduct {
  id: string
  name: string
  brand: string | null
  slug: string
  price: number
  isOnSale: boolean
  salePrice: number | null
  images: { url: string; alt: string | null }[]
  category: { id: string; name: string } | null
  variants: { stock: number }[]
}

function FeaturedProducts() {
  const [products, setProducts] = useState<LatestProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)
  const productsPerView = 4
  const mobileProductsPerView = 2

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products/featured')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error al cargar productos destacados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalStock = (product: LatestProduct) => {
    return product.variants.reduce((total, v) => total + v.stock, 0)
  }

  const getProductPrice = (product: LatestProduct) => {
    if (product.isOnSale && product.salePrice) {
      return product.salePrice
    }
    return product.price
  }

  const getDiscount = (product: LatestProduct) => {
    if (!product.isOnSale || !product.salePrice) return 0
    return Math.round(((parseFloat(product.price.toString()) - parseFloat(product.salePrice.toString())) / parseFloat(product.price.toString())) * 100)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + productsPerView >= products.length ? 0 : prev + productsPerView))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - productsPerView < 0 ? Math.max(0, products.length - productsPerView) : prev - productsPerView))
  }

  const nextMobileSlide = () => {
    setMobileIndex((prev) => (prev + mobileProductsPerView >= products.length ? 0 : prev + mobileProductsPerView))
  }

  const prevMobileSlide = () => {
    setMobileIndex((prev) => (prev - mobileProductsPerView < 0 ? Math.max(0, products.length - mobileProductsPerView) : prev - mobileProductsPerView))
  }

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-8">
        Cargando productos destacados...
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  const visibleProducts = products.length > productsPerView ? products.slice(currentIndex, currentIndex + productsPerView) : products
  const visibleMobileProducts = products.slice(mobileIndex, mobileIndex + mobileProductsPerView)

  return (
    <>
      {/* Mobile: Carrusel con 2 productos */}
      <div className="md:hidden relative">
        <div className="grid grid-cols-2 gap-3">
          {visibleMobileProducts.map((product) => (
            <FeaturedProductCard key={product.id} product={product} getTotalStock={getTotalStock} getProductPrice={getProductPrice} getDiscount={getDiscount} />
          ))}
        </div>

        {/* Controles Mobile */}
        {products.length > mobileProductsPerView && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevMobileSlide}
              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mobileIndex === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Indicadores */}
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(products.length / mobileProductsPerView) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setMobileIndex(idx * mobileProductsPerView)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    Math.floor(mobileIndex / mobileProductsPerView) === idx
                      ? 'bg-purple-500 w-6'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextMobileSlide}
              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mobileIndex + mobileProductsPerView >= products.length}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Desktop: Carrusel si hay más de 4 productos */}
      <div className="hidden md:block relative">
        {products.length > productsPerView && (
          <>
            {/* Botón Anterior */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentIndex === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Botón Siguiente */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentIndex + productsPerView >= products.length}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Grid de productos */}
        <div className={`grid grid-cols-4 gap-4 ${products.length > productsPerView ? 'px-12' : ''}`}>
          {visibleProducts.map((product) => (
            <FeaturedProductCard key={product.id} product={product} getTotalStock={getTotalStock} getProductPrice={getProductPrice} getDiscount={getDiscount} />
          ))}
        </div>

        {/* Indicadores */}
        {products.length > productsPerView && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(products.length / productsPerView) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx * productsPerView)}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / productsPerView) === idx
                    ? 'bg-purple-500 w-8'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function FeaturedProductCard({
  product,
  getTotalStock,
  getProductPrice,
  getDiscount
}: {
  product: LatestProduct
  getTotalStock: (product: LatestProduct) => number
  getProductPrice: (product: LatestProduct) => number | string
  getDiscount: (product: LatestProduct) => number
}) {
  const discount = getDiscount(product)

  return (
    <Link
      href={`/productos/${product.slug}`}
      className={`group relative bg-gray-900/50 border rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 ${
        product.isOnSale
          ? 'border-yellow-500/20 hover:border-yellow-500/50'
          : 'border-purple-500/20 hover:border-purple-500/50'
      }`}
    >
      {/* Badge de destacado */}
      <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
        ⭐
      </div>

      {/* Badge de descuento */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
          -{discount}%
        </div>
      )}

      {/* Imagen */}
      <div className="relative aspect-square bg-gray-800">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
            Sin imagen
          </div>
        )}
        {getTotalStock(product) === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Sin Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 sm:p-3">
        {product.brand && (
          <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
        )}
        <h3 className={`text-sm font-bold mb-1 line-clamp-2 transition-colors text-white ${
          product.isOnSale ? 'group-hover:text-yellow-400' : 'group-hover:text-purple-400'
        }`}>
          {product.name}
        </h3>

        {product.category && (
          <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
        )}

        {product.isOnSale && product.salePrice ? (
          <div className="space-y-1">
            {/* Precio anterior tachado */}
            <div className="text-sm text-gray-400 line-through">
              ${parseFloat(product.price.toString()).toLocaleString('es-AR')}
            </div>
            {/* Precio de oferta en dorado */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-yellow-400">
                ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR')}
              </span>
              <button className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-purple-400">
              ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR')}
            </span>
            <button className="p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Link>
  )
}

function LatestProducts() {
  const [products, setProducts] = useState<LatestProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileIndex, setMobileIndex] = useState(0)
  const mobileProductsPerView = 2

  useEffect(() => {
    fetchLatestProducts()
  }, [])

  const fetchLatestProducts = async () => {
    try {
      const response = await fetch('/api/products/latest')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalStock = (product: LatestProduct) => {
    return product.variants.reduce((total, v) => total + v.stock, 0)
  }

  const getProductPrice = (product: LatestProduct) => {
    if (product.isOnSale && product.salePrice) {
      return product.salePrice
    }
    return product.price
  }

  const getDiscount = (product: LatestProduct) => {
    if (!product.isOnSale || !product.salePrice) return 0
    return Math.round(((parseFloat(product.price.toString()) - parseFloat(product.salePrice.toString())) / parseFloat(product.price.toString())) * 100)
  }

  const nextMobileSlide = () => {
    setMobileIndex((prev) => (prev + mobileProductsPerView >= products.length ? 0 : prev + mobileProductsPerView))
  }

  const prevMobileSlide = () => {
    setMobileIndex((prev) => (prev - mobileProductsPerView < 0 ? Math.max(0, products.length - mobileProductsPerView) : prev - mobileProductsPerView))
  }

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-8">
        Cargando productos...
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  const visibleMobileProducts = products.slice(mobileIndex, mobileIndex + mobileProductsPerView)

  return (
    <>
      {/* Mobile: Carrusel con 2 productos */}
      <div className="md:hidden relative">
        <div className="grid grid-cols-2 gap-3">
          {visibleMobileProducts.map((product) => {
            const discount = getDiscount(product)
            return (
              <Link
                key={product.id}
                href={`/productos/${product.slug}`}
                className={`group relative bg-gray-900/50 border rounded-lg overflow-hidden transition-all hover:scale-105 ${
                  product.isOnSale
                    ? 'border-yellow-500/20 hover:border-yellow-500/50'
                    : 'border-gray-800 hover:border-green-500/50'
                }`}
              >
                {/* Badge de descuento */}
                {discount > 0 && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                    -{discount}%
                  </div>
                )}

                {/* Imagen */}
                <div className="relative aspect-square bg-gray-800">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      Sin imagen
                    </div>
                  )}
                  {getTotalStock(product) === 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Sin Stock</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2 sm:p-3">
                  {product.brand && (
                    <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
                  )}
                  <h3 className={`text-sm font-bold mb-1 line-clamp-2 transition-colors text-white ${
                    product.isOnSale ? 'group-hover:text-yellow-400' : 'group-hover:text-green-400'
                  }`}>
                    {product.name}
                  </h3>

                  {product.category && (
                    <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                  )}

                  {product.isOnSale && product.salePrice ? (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-400 line-through">
                        ${parseFloat(product.price.toString()).toLocaleString('es-AR')}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-yellow-400">
                          ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR')}
                        </span>
                        <button className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-green-400">
                        ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR')}
                      </span>
                      <button className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Controles Mobile - Verde */}
        {products.length > mobileProductsPerView && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevMobileSlide}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mobileIndex === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Indicadores */}
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(products.length / mobileProductsPerView) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setMobileIndex(idx * mobileProductsPerView)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    Math.floor(mobileIndex / mobileProductsPerView) === idx
                      ? 'bg-green-500 w-6'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextMobileSlide}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mobileIndex + mobileProductsPerView >= products.length}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Desktop: Grid normal */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {products.map((product) => {
          const discount = getDiscount(product)
          return (
            <Link
              key={product.id}
              href={`/productos/${product.slug}`}
              className={`group relative bg-gray-900/50 border rounded-lg overflow-hidden transition-all hover:scale-105 ${
                product.isOnSale
                  ? 'border-yellow-500/20 hover:border-yellow-500/50'
                  : 'border-gray-800 hover:border-green-500/50'
              }`}
            >
              {/* Badge de descuento */}
              {discount > 0 && (
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                  -{discount}%
                </div>
              )}

              {/* Imagen */}
              <div className="relative aspect-square bg-gray-800">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    Sin imagen
                  </div>
                )}
                {getTotalStock(product) === 0 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Sin Stock</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2 sm:p-3">
                {product.brand && (
                  <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
                )}
                <h3 className={`text-sm font-bold mb-1 line-clamp-2 transition-colors text-white ${
                  product.isOnSale ? 'group-hover:text-yellow-400' : 'group-hover:text-green-400'
                }`}>
                  {product.name}
                </h3>

                {product.category && (
                  <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                )}

                {product.isOnSale && product.salePrice ? (
                  <div className="space-y-1">
                    {/* Precio anterior tachado */}
                    <div className="text-sm text-gray-400 line-through">
                      ${parseFloat(product.price.toString()).toLocaleString('es-AR')}
                    </div>
                    {/* Precio de oferta en dorado */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-yellow-400">
                        ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR')}
                      </span>
                      <button className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-green-400">
                      ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR')}
                    </span>
                    <button className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-black rounded-lg md:rounded-xl p-4 md:p-8 text-center hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:-translate-y-2 border border-gray-800 hover:border-green-500/50 group">
      <h3 className="text-base md:text-xl font-bold text-white mb-2 md:mb-3">{title}</h3>
      <p className="text-sm md:text-base text-gray-400">{description}</p>
    </div>
  )
}
