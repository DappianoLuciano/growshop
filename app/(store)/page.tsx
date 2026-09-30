'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import ProductImageCarousel from '@/components/store/ProductImageCarousel'

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
      <section className="relative pt-32 md:pt-44 pb-12 md:pb-24 flex items-center justify-center overflow-hidden z-10">

        {/* Contenido */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="mb-8 md:mb-16 inline-block">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 leading-tight">
              EL RINCON DEL CULTIVADOR
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 animate-fadeIn-delayed-2">
            <Link
              href="/ofertas"
              className="group relative px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg md:text-xl rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 shadow-lg shadow-yellow-500/30"
            >
              <span className="relative z-10">Ver Ofertas</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              href="/productos"
              className="group relative px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg md:text-xl rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 shadow-lg shadow-green-500/30"
            >
              <span className="relative z-10">Explorar Productos</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features - Beneficios */}
      <section className="py-8 md:py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center group">
              <div className="text-green-400 mb-3 md:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-black text-white mb-2 uppercase tracking-tight">
                Envíos a Todo el País
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                Nos encontramos en Berazategui. Envíos a todo el país por correo argentino.
                <br />
                Si estás en los alrededores podemos enviar por motomensajería o coordinar punto de encuentro.
              </p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="text-green-400 mb-3 md:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-black text-white mb-2 uppercase tracking-tight">
                Pagá Como Quieras
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                Efectivo o transferencia.
                <br />
                Cualquier banco o entidad financiera.
              </p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="text-green-400 mb-3 md:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-black text-white mb-2 uppercase tracking-tight">
                Comprá con Seguridad
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                Comprá con seguridad, si querés que te guiemos solo decinos o si tenés alguna duda de algún producto consultanos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="relative py-6 md:py-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-xl md:text-3xl font-bold text-white">
              PRODUCTOS DESTACADOS
            </h2>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Categorías con Bento Grid */}
      <section className="relative py-6 md:py-20 z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-4 md:mb-12 text-center">
            CATEGORÍAS PRINCIPALES
          </h2>
          <BentoGridCategories />
        </div>
      </section>

      {/* Ofertas */}
      <section className="relative py-6 md:py-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-4 md:mb-8 text-center">
            OFERTAS
          </h2>
          <OfferProducts />
          <div className="flex justify-center mt-8">
            <Link
              href="/ofertas"
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:scale-105 transition-all duration-300"
            >
              Ver Ofertas
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
}

// Glassmorphism 3D Categories
function BentoGridCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/admin/categories?section=GROW')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      }
    }
    fetchCategories()
  }, [])

  if (categories.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        Cargando categorías...
      </div>
    )
  }

  return (
    <>
      {/* Mobile: Simple Grid 2x2 */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {categories.slice(0, 6).map((category, idx) => (
          <Link
            key={category.id}
            href={`/productos?categoria=${category.id}`}
            className="group relative h-36 rounded-xl overflow-hidden backdrop-blur-xl border border-white/10"
            style={{
              background: `linear-gradient(135deg, ${category.color || '#10b981'}40, ${category.color || '#10b981'}20)`,
              animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative h-full p-3 flex items-center justify-center">
              <h3 className="text-base font-black text-white text-center leading-tight">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: Glassmorphism Grid */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {categories.slice(0, 6).map((category, idx) => (
          <GlassCard key={category.id} category={category} delay={idx * 0.15} />
        ))}
      </div>

      {/* Ver todas link */}
      {categories.length > 6 && (
        <div className="flex justify-center mt-12">
          <Link
            href="/productos"
            className="group px-8 py-4 relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/20 font-bold text-white transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.2))'
            }}
          >
            <span className="relative z-10">Ver Todas las Categorías</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      )}
    </>
  )
}

// Glass Card with 3D Tilt
function GlassCard({
  category,
  delay = 0
}: {
  category: Category
  delay?: number
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const color = category.color || '#10b981'

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10

    setTilt({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <Link
      href={`/productos?categoria=${category.id}`}
      className="group relative block"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}s both`,
        perspective: '1000px'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect background */}
      <div
        className="absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${color}60, ${color}30)`
        }}
      />

      {/* Main card */}
      <div
        className="relative h-56 rounded-2xl backdrop-blur-2xl border border-white/10 overflow-hidden transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${color}25, ${color}10)`,
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${isHovered ? '20px' : '0'})`,
          boxShadow: isHovered
            ? `0 30px 60px ${color}40, 0 0 0 1px ${color}30 inset`
            : '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        {/* Glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

        {/* Animated gradient orb */}
        <div
          className="absolute w-32 h-32 rounded-full blur-3xl opacity-30 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${color}, transparent)`,
            top: isHovered ? '-20%' : '10%',
            right: isHovered ? '-20%' : '10%',
          }}
        />

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between z-10">
          {/* Icon */}
          <div className="flex items-start justify-between">
            <div
              className="p-3 rounded-xl backdrop-blur-xl transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${color}40, ${color}20)`,
                transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                boxShadow: isHovered ? `0 10px 30px ${color}60` : 'none'
              }}
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            {/* Color indicator */}
            <div
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                background: color,
                boxShadow: `0 0 20px ${color}80`,
                transform: isHovered ? 'scale(1.3)' : 'scale(1)'
              }}
            />
          </div>

          {/* Title */}
          <div>
            <h3
              className="text-2xl font-black text-white mb-2 transition-all duration-300 leading-tight"
              style={{
                textShadow: `0 0 30px ${color}60`,
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)'
              }}
            >
              {category.name}
            </h3>

            {/* CTA */}
            <div className="flex items-center gap-2 mt-3 text-white/80 group-hover:text-white transition-colors">
              <span className="text-xs font-semibold">Explorar</span>
              <svg
                className="w-4 h-4 transition-transform duration-300"
                style={{
                  transform: isHovered ? 'translateX(5px)' : 'translateX(0)'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Shine effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${color}20 50%, transparent 70%)`,
            transform: 'translateX(-100%)',
            animation: isHovered ? 'shine 2s infinite' : 'none'
          }}
        />
      </div>
    </Link>
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
  category: { id: string; name: string; imageFit?: 'COVER' | 'CONTAIN' } | null
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
    async function fetchFeaturedProducts() {
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
    fetchFeaturedProducts()
  }, [])

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
          <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-full px-12">
            {Array.from({ length: Math.ceil(products.length / productsPerView) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx * productsPerView)}
                className={`shrink-0 w-2 h-2 rounded-full transition-all ${
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
      className={`group relative bg-gray-900 border rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 ${
        product.isOnSale
          ? 'border-yellow-500/30 hover:border-yellow-500/60'
          : 'border-purple-500/30 hover:border-purple-500/60'
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
        <h3 className={`text-base font-bold mb-1.5 line-clamp-2 transition-colors text-white ${
          product.isOnSale ? 'group-hover:text-yellow-400' : 'group-hover:text-purple-400'
        }`}>
          {product.name}
        </h3>

        {product.category && (
          <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
        )}

        {product.isOnSale && product.salePrice ? (
          <div className="space-y-1">
            {/* Precio anterior tachado */}
            <div className="text-sm sm:text-base text-gray-400 line-through">
              ${parseFloat(product.price.toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </div>
            {/* Precio de oferta en dorado */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="text-lg sm:text-2xl font-black whitespace-nowrap text-yellow-400">
                ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </span>
              <button className="p-1.5 sm:p-2 shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all">
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className="text-lg sm:text-2xl font-black whitespace-nowrap text-purple-400">
              ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </span>
            <button className="p-1.5 sm:p-2 shrink-0 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all">
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </Link>
  )
}

function OfferProducts() {
  const [products, setProducts] = useState<LatestProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileIndex, setMobileIndex] = useState(0)
  const mobileProductsPerView = 2

  useEffect(() => {
    async function fetchOfferProducts() {
      try {
        const response = await fetch('/api/products/offers')
        if (response.ok) {
          const data = await response.json()
          // Limitar a 4 productos
          setProducts(data.slice(0, 4))
        }
      } catch (error) {
        console.error('Error al cargar ofertas:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOfferProducts()
  }, [])

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
                className={`group relative bg-gray-900 border rounded-lg overflow-hidden transition-all hover:scale-105 ${
                  product.isOnSale
                    ? 'border-yellow-500/30 hover:border-yellow-500/60'
                    : 'border-gray-800 hover:border-green-500/50'
                }`}
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
                  <h3 className={`text-base font-bold mb-1.5 line-clamp-2 transition-colors text-white ${
                    product.isOnSale ? 'group-hover:text-yellow-400' : 'group-hover:text-green-400'
                  }`}>
                    {product.name}
                  </h3>

                  {product.category && (
                    <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                  )}

                  {product.isOnSale && product.salePrice ? (
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base text-gray-400 line-through">
                        ${parseFloat(product.price.toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <span className="text-lg sm:text-2xl font-black whitespace-nowrap text-yellow-400">
                          ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                        <button className="p-1.5 sm:p-2 shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <span className="text-lg sm:text-2xl font-black whitespace-nowrap text-green-400">
                        ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </span>
                      <button className="p-1.5 sm:p-2 shrink-0 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all">
                        <ShoppingCart className="w-5 h-5" />
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
            <div className="flex flex-wrap justify-center gap-2 max-w-[70vw]">
              {Array.from({ length: Math.ceil(products.length / mobileProductsPerView) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setMobileIndex(idx * mobileProductsPerView)}
                  className={`shrink-0 w-2 h-2 rounded-full transition-all ${
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
              className={`group relative bg-gray-900 border rounded-lg overflow-hidden transition-all hover:scale-105 ${
                product.isOnSale
                  ? 'border-yellow-500/30 hover:border-yellow-500/60'
                  : 'border-gray-800 hover:border-green-500/50'
              }`}
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
                <h3 className={`text-base font-bold mb-1.5 line-clamp-2 transition-colors text-white ${
                  product.isOnSale ? 'group-hover:text-yellow-400' : 'group-hover:text-green-400'
                }`}>
                  {product.name}
                </h3>

                {product.category && (
                  <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                )}

                {product.isOnSale && product.salePrice ? (
                  <div className="space-y-1">
                    {/* Precio anterior tachado */}
                    <div className="text-sm sm:text-base text-gray-400 line-through">
                      ${parseFloat(product.price.toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </div>
                    {/* Precio de oferta en dorado */}
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <span className="text-lg sm:text-2xl font-black whitespace-nowrap text-yellow-400">
                        ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </span>
                      <button className="p-1.5 sm:p-2 shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <span className="text-lg sm:text-2xl font-black whitespace-nowrap text-green-400">
                      ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                    <button className="p-1.5 sm:p-2 shrink-0 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all">
                      <ShoppingCart className="w-5 h-5" />
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

