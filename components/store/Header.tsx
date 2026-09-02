'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Sparkles, Search, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  name: string
  brand: string | null
  slug: string
  price: number
  isOnSale: boolean
  salePrice: number | null
  image: string | null
}

export default function Header() {
  const { totalItems } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searching, setSearching] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const formatPrice = (price: number) => {
    const numStr = Math.floor(price).toString()
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setSearching(true)
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm.trim())}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data)
          setShowResults(true)
        }
      } catch (error) {
        console.error('Error en búsqueda:', error)
      } finally {
        setSearching(false)
      }
    }

    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/productos?busqueda=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setShowResults(false)
    }
  }

  const handleResultClick = (slug: string) => {
    router.push(`/productos/${slug}`)
    setSearchTerm('')
    setShowResults(false)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:gap-6 h-28">
            {/* Contenedor izquierda (Hamburguesa + Logo) - Mobile */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Menú Hamburguesa */}
              <button
                onClick={toggleMenu}
                className="h-10 w-10 flex items-center justify-center bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-green-500/10 hover:border-green-500 transition-all duration-300"
                aria-label="Menú"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>

              {/* Logo Mobile */}
              <Link href="/" className="h-16 w-16 flex items-center justify-center group flex-shrink-0">
                <div className="relative w-16 h-16">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Image
                      src="/images/logo.jpg"
                      alt="AGRO.GROW Logo"
                      fill
                      className="object-contain rounded-full"
                      priority
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Logo Desktop */}
            <Link href="/" className="hidden md:flex items-center group flex-shrink-0 ml-8">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative w-24 h-24 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Image
                    src="/images/logo.jpg"
                    alt="AGRO.GROW Logo"
                    fill
                    className="object-contain rounded-full"
                    priority
                  />
                </div>
              </div>
            </Link>

            {/* Buscador - Centro Mobile y Desktop */}
            <div className="flex-1 md:max-w-md flex justify-center">
              <form onSubmit={handleSearch} className="relative w-full max-w-[140px] md:max-w-full focus-within:max-w-full transition-all duration-500 ease-in-out">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none transition-all duration-500 ease-in-out" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  placeholder="Buscar..."
                  className="w-full h-12 pl-9 md:pl-10 pr-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-sm md:text-base placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all duration-500 ease-in-out"
                />

                {/* Dropdown de resultados */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 min-w-[320px]">
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((result) => {
                        const discount = result.isOnSale && result.salePrice
                          ? Math.round(((result.price - result.salePrice) / result.price) * 100)
                          : 0
                        const displayPrice = result.isOnSale && result.salePrice ? result.salePrice : result.price

                        return (
                          <button
                            key={result.id}
                            type="button"
                            onClick={() => handleResultClick(result.slug)}
                            className="w-full px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-3 border-b border-gray-800 last:border-0"
                          >
                            {result.image && (
                              <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                                {discount > 0 && (
                                  <div className="absolute -top-1 -right-1 z-10 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold rounded-full">
                                    -{discount}%
                                  </div>
                                )}
                                <img
                                  src={result.image}
                                  alt={result.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              {result.brand && (
                                <p className="text-xs text-gray-500">{result.brand}</p>
                              )}
                              <p className="text-sm text-white font-medium line-clamp-1">{result.name}</p>
                              {result.isOnSale && result.salePrice ? (
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-400 line-through">
                                    ${formatPrice(result.price)}
                                  </p>
                                  <p className="text-sm text-yellow-400 font-bold">
                                    ${formatPrice(displayPrice)}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-green-400 font-bold">
                                  ${formatPrice(displayPrice)}
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Enlaces y Cart - Derecha */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {/* Navigation */}
              <nav className="flex items-center gap-1">
                <NavLink href="/productos">
                  PRODUCTOS
                </NavLink>
                <NavLink href="/combos">
                  COMBOS
                </NavLink>
                <NavLink href="/ofertas" special>
                  OFERTAS
                </NavLink>
              </nav>

              {/* Cart */}
              <Link
                href="/carrito"
                className="relative group"
              >
                <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/50">
                  <ShoppingCart className="w-5 h-5 text-white" />
                  <span className="text-white font-bold hidden lg:block">CARRITO</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Cart Mobile */}
            <Link
              href="/carrito"
              className="md:hidden relative group flex-shrink-0"
            >
              <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
                <ShoppingCart className="w-5 h-5 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
    </header>

    {/* Menú lateral */}
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeMenu}
      />

      {/* Panel del menú */}
      <div
        className={`absolute top-0 left-0 h-full w-80 bg-gradient-to-br from-gray-900 to-black border-r border-green-500/20 shadow-2xl transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header del menú */}
        <div className="relative flex items-center justify-center p-6 border-b border-gray-800">
          <div className="relative w-20 h-20">
            <Image
              src="/images/logo.jpg"
              alt="AGRO.GROW"
              fill
              className="object-contain rounded-full"
            />
          </div>
          <button
            onClick={closeMenu}
            className="absolute right-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Links del menú */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          <Link
            href="/"
            onClick={closeMenu}
            className={`block px-6 py-3 text-base font-semibold rounded-xl transition-all ${
              isActive('/')
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white border-2 border-green-500'
                : 'text-gray-300 hover:bg-gray-800 border-2 border-transparent'
            }`}
          >
            INICIO
          </Link>
          <Link
            href="/productos"
            onClick={closeMenu}
            className={`block px-6 py-3 text-base font-semibold rounded-xl transition-all ${
              isActive('/productos')
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white border-2 border-green-500'
                : 'text-gray-300 hover:bg-gray-800 border-2 border-transparent'
            }`}
          >
            PRODUCTOS
          </Link>
          <Link
            href="/combos"
            onClick={closeMenu}
            className={`block px-6 py-3 text-base font-semibold rounded-xl transition-all ${
              isActive('/combos')
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white border-2 border-green-500'
                : 'text-gray-300 hover:bg-gray-800 border-2 border-transparent'
            }`}
          >
            COMBOS
          </Link>
          <Link
            href="/ofertas"
            onClick={closeMenu}
            className={`block px-6 py-3 text-base font-semibold rounded-xl transition-all ${
              isActive('/ofertas')
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-2 border-yellow-500'
                : 'text-gray-300 hover:bg-gray-800 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              OFERTAS
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          </Link>
          <Link
            href="/carrito"
            onClick={closeMenu}
            className="block px-6 py-3 text-base font-semibold rounded-xl text-gray-300 hover:bg-gray-800 border-2 border-transparent transition-all"
          >
            CARRITO {totalItems > 0 && `(${totalItems})`}
          </Link>
        </nav>

        {/* Footer del menú */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <a
            href="https://www.instagram.com/agro.grow.arg?igsh=cjN4ZXI0NHU5ZzE2&igsi=cjN4ZXI0NHU5ZzE2"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>SEGUINOS EN INSTAGRAM</span>
          </a>
        </div>
      </div>
    </div>
  </>
  )
}

function NavLink({
  href,
  children,
  special = false
}: {
  href: string
  children: React.ReactNode
  special?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
        special
          ? 'text-yellow-400 hover:text-yellow-300'
          : 'text-gray-300 hover:text-white'
      }`}
    >
      <span>{children}</span>

      {special && (
        <>
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300 -z-10"></div>
        </>
      )}

      {!special && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300 -z-10"></div>
      )}
    </Link>
  )
}
