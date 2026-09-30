'use client'

import { useState, useEffect, use, Suspense } from 'react'
import { ArrowLeft, ShoppingCart, Loader2, Check } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ProductImageCarousel from '@/components/store/ProductImageCarousel'
import { useCart } from '@/contexts/CartContext'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  brand: string | null
  slug: string
  description: string | null
  price: number
  isOnSale: boolean
  salePrice: number | null
  images: { url: string; alt: string | null; order: number }[]
  variants: {
    id: string
    sku: string | null
    price: number | null
    stock: number
    capacity: string | null
    size: string | null
    power: string | null
  }[]
  category: {
    id: string
    name: string
    description: string | null
    imageFit?: 'COVER' | 'CONTAIN'
    section?: 'GROW' | 'FERRETERIA' | 'ACCESORIOS'
  } | null
}

const sectionBack: Record<string, { url: string; label: string }> = {
  productos: { url: '/productos', label: 'Volver a Productos' },
  ferreteria: { url: '/ferreteria', label: 'Volver a Ferretería' },
  accesorios: { url: '/accesorios', label: 'Volver a Accesorios' },
  ofertas: { url: '/ofertas', label: 'Volver a Ofertas' },
  combos: { url: '/combos', label: 'Volver a Combos' },
}

function ProductoDetailContent({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const fromParam = searchParams.get('from')
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${resolvedParams.slug}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        } else {
          setError('Producto no encontrado')
        }
      } catch (error) {
        console.error('Error al cargar producto:', error)
        setError('Error al cargar el producto')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [resolvedParams.slug])

  const productId = product?.id
  const hasCategory = Boolean(product?.category?.id)

  useEffect(() => {
    if (!productId || !hasCategory) return
    let cancelled = false
    async function fetchSuggestedProducts() {
      try {
        // Buscar todos los productos sin filtro de categoría
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          // Filtrar el producto actual y aleatorizar
          const filtered = data.filter((p: Product) => p.id !== productId)
          const shuffled = filtered.sort(() => Math.random() - 0.5)
          if (!cancelled) setSuggestedProducts(shuffled.slice(0, 4))
        }
      } catch (error) {
        console.error('Error al cargar productos sugeridos:', error)
      }
    }
    fetchSuggestedProducts()
    return () => { cancelled = true }
  }, [productId, hasCategory])

  const getTotalStock = (product: Product) => {
    return product.variants.reduce((total, v) => total + v.stock, 0)
  }

  const getProductPrice = (product: Product) => {
    if (product.isOnSale && product.salePrice) {
      return product.salePrice
    }
    const variant = product.variants[0]
    return variant?.price || product.price
  }

  const getDiscount = (product: Product) => {
    if (!product.isOnSale || !product.salePrice) return 0
    return Math.round(((parseFloat(product.price.toString()) - parseFloat(product.salePrice.toString())) / parseFloat(product.price.toString())) * 100)
  }

  const formatPrice = (price: number | string) => {
    const numPrice = Math.floor(parseFloat(price.toString()))
    return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleAddToCart = () => {
    if (!product || !variant) return

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
      // Misma regla que el servidor (lib/orders/pricing.ts): oferta > variante > base
      price: parseFloat(
        (product.isOnSale && product.salePrice ? product.salePrice : variant.price || product.price).toString()
      ),
      image: product.images[0]?.url || null,
      maxStock: variant.stock,
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
            <span className="text-gray-400">Cargando producto...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="relative bg-black min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-black to-black animate-gradient-shift -z-10"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
            <Link href="/productos" className="text-green-400 hover:text-green-300">
              Volver a productos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalStock = getTotalStock(product)
  const variant = product.variants[0]

  const fallbackSection = product.category?.section === 'FERRETERIA'
    ? 'ferreteria'
    : product.category?.section === 'ACCESORIOS'
      ? 'accesorios'
      : product.isOnSale
        ? 'ofertas'
        : 'productos'
  const back = sectionBack[fromParam || ''] || sectionBack[fallbackSection]
  const backUrl = back.url
  const backText = back.label

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
            href={backUrl}
            className={`inline-flex items-center gap-2 mb-4 transition-colors text-sm ${
              product.isOnSale
                ? 'text-yellow-400 hover:text-yellow-300'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            {backText}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Carrusel de imágenes */}
            <div className="space-y-3">
              <div className="relative">
                <div className="aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                  <ProductImageCarousel
                    images={product.images}
                    productName={product.name}
                    compact={false}
                    currentIndex={currentImageIndex}
                    onIndexChange={setCurrentImageIndex}
                    imageFit={product.category?.imageFit}
                  />
                </div>

                {/* Dots debajo de la foto */}
                {product.images.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-green-500 w-6'
                            : 'bg-gray-600 hover:bg-gray-500 w-2'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        product.category?.imageFit === 'CONTAIN' ? 'bg-white' : 'bg-gray-800'
                      } ${
                        currentImageIndex === index
                          ? 'border-green-500 ring-2 ring-green-500/30'
                          : 'border-gray-700 hover:border-green-500/50'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || `${product.name} - ${index + 1}`}
                        fill
                        className={product.category?.imageFit === 'CONTAIN' ? 'object-contain p-1' : 'object-cover'}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info del producto */}
            <div className="flex flex-col">
              {product.category && (
                <div className="mb-2">
                  <span className="text-xs text-green-400 font-semibold">
                    {product.category.name}
                  </span>
                  {product.category.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {product.category.description}
                    </p>
                  )}
                </div>
              )}

              {product.brand && (
                <p className="text-sm text-gray-400 mb-1">{product.brand}</p>
              )}

              <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
                {product.name}
              </h1>

              {product.description && (
                <div
                  className="text-sm text-gray-300 mb-4 leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}

              {/* Características */}
              {(variant?.capacity || variant?.size || variant?.power) && (
                <div className="mb-4 space-y-1.5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Características
                  </h3>
                  {variant.capacity && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Capacidad:</span>
                      <span className="text-white font-semibold">{variant.capacity}</span>
                    </div>
                  )}
                  {variant.size && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Tamaño:</span>
                      <span className="text-white font-semibold">{variant.size}</span>
                    </div>
                  )}
                  {variant.power && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Potencia:</span>
                      <span className="text-white font-semibold">{variant.power}</span>
                    </div>
                  )}
                </div>
              )}

              {/* SKU */}
              {variant?.sku && (
                <p className="text-xs text-gray-500 mb-4">SKU: {variant.sku}</p>
              )}

              {/* Precio y stock */}
              <div className="mb-4">
                {product.isOnSale && product.salePrice ? (
                  <>
                    {/* Badge de oferta */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full mb-3">
                      <span>🔥 OFERTA</span>
                      <span>-{getDiscount(product)}%</span>
                    </div>

                    <div className="space-y-2 mb-2">
                      {/* Precio original tachado */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Precio normal:</span>
                        <span className="text-xl text-gray-400 line-through">
                          ${parseFloat(product.price.toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      {/* Precio de oferta en dorado */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-yellow-400">
                          ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-sm text-yellow-400 font-semibold">
                          ¡Ahorrás ${(parseFloat(product.price.toString()) - parseFloat(product.salePrice.toString())).toLocaleString('es-AR', { maximumFractionDigits: 0 })}!
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-black text-green-400">
                      ${parseFloat(getProductPrice(product).toString()).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                )}

                {totalStock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400 font-semibold">
                      {totalStock < 10 ? `Solo ${totalStock} disponibles` : 'En stock'}
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
                disabled={totalStock === 0 || addedToCart}
                className={`flex items-center justify-center gap-2 w-full py-3 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  product.isOnSale
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {totalStock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Productos Sugeridos */}
          {suggestedProducts.length > 0 && (
            <div className="mt-12 md:mt-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                PRODUCTOS SUGERIDOS
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {suggestedProducts.map((suggestedProduct) => {
                  const discount = getDiscount(suggestedProduct)
                  const displayPrice = getProductPrice(suggestedProduct)

                  return (
                    <Link
                      key={suggestedProduct.id}
                      href={`/productos/${suggestedProduct.slug}`}
                      className={`group relative bg-gray-900/50 border rounded-lg overflow-hidden transition-all hover:scale-105 ${
                        suggestedProduct.isOnSale
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
                      <div className={`relative aspect-square ${suggestedProduct.category?.imageFit === 'CONTAIN' ? 'bg-white' : 'bg-gray-800'}`}>
                        {suggestedProduct.images[0] ? (
                          <Image
                            src={suggestedProduct.images[0].url}
                            alt={suggestedProduct.images[0].alt || suggestedProduct.name}
                            fill
                            className={suggestedProduct.category?.imageFit === 'CONTAIN' ? 'object-contain p-2' : 'object-cover'}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                            Sin imagen
                          </div>
                        )}
                        {getTotalStock(suggestedProduct) === 0 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Sin Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2 sm:p-3">
                        {suggestedProduct.brand && (
                          <p className="text-xs text-gray-400 mb-0.5">{suggestedProduct.brand}</p>
                        )}
                        <h3 className={`text-sm font-bold mb-1 line-clamp-2 transition-colors text-white ${
                          suggestedProduct.isOnSale ? 'group-hover:text-yellow-400' : 'group-hover:text-green-400'
                        }`}>
                          {suggestedProduct.name}
                        </h3>

                        {suggestedProduct.category && (
                          <p className="text-xs text-gray-500 mb-2">{suggestedProduct.category.name}</p>
                        )}

                        {suggestedProduct.isOnSale && suggestedProduct.salePrice ? (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-400 line-through">
                              ${formatPrice(suggestedProduct.price)}
                            </div>
                            <div className="text-lg font-black text-yellow-400">
                              ${formatPrice(displayPrice)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg font-black text-green-400">
                            ${formatPrice(displayPrice)}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={
      <div className="relative bg-black min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      </div>
    }>
      <ProductoDetailContent params={params} />
    </Suspense>
  )
}
