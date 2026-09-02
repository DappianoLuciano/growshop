'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Save, Upload, Loader2, Plus, X, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ProductVariant {
  id: string
  sku: string | null
  stock: number
  size: string | null
  capacity: string | null
  power: string | null
  product: {
    id: string
    name: string
    brand: string | null
    images: { url: string; alt: string | null }[]
  }
}

interface Product {
  id: string
  name: string
  brand: string | null
  images: { url: string; alt: string | null }[]
  variants: ProductVariant[]
}

interface SelectedProduct {
  variantId: string
  productName: string
  brand: string | null
  quantity: number
  sku: string | null
  image: string | null
}

export default function EditarComboPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    isActive: true,
    isFeatured: false,
  })

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCombo()
    fetchProducts()
  }, [])

  const fetchCombo = async () => {
    try {
      const response = await fetch(`/api/admin/combos/${resolvedParams.id}`)
      if (response.ok) {
        const combo = await response.json()

        setFormData({
          name: combo.name || '',
          description: combo.description || '',
          price: parseFloat(combo.price) || 0,
          image: combo.image || '',
          isActive: combo.isActive,
          isFeatured: combo.isFeatured || false,
        })

        // Cargar productos del combo
        const comboProducts: SelectedProduct[] = combo.products.map((cp: any) => ({
          variantId: cp.variantId,
          productName: cp.variant.product.name,
          brand: cp.variant.product.brand,
          quantity: cp.quantity,
          sku: cp.variant.sku,
          image: cp.variant.product.images[0]?.url || null,
        }))
        setSelectedProducts(comboProducts)
      }
    } catch (error) {
      console.error('Error al cargar combo:', error)
      setError('Error al cargar el combo')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.filter((p: Product) => p.isActive))
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addProductToCombo = (variant: ProductVariant, product: Product) => {
    if (selectedProducts.find(p => p.variantId === variant.id)) {
      setError('Este producto ya está en el combo')
      return
    }

    const newProduct: SelectedProduct = {
      variantId: variant.id,
      productName: product.name,
      brand: product.brand,
      quantity: 1,
      sku: variant.sku,
      image: product.images[0]?.url || null,
    }

    setSelectedProducts([...selectedProducts, newProduct])
    setShowProductSelector(false)
    setSearchQuery('')
    setError('')
  }

  const removeProductFromCombo = (variantId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.variantId !== variantId))
  }

  const updateProductQuantity = (variantId: string, quantity: number) => {
    if (quantity < 1) return
    setSelectedProducts(
      selectedProducts.map(p =>
        p.variantId === variantId ? { ...p, quantity } : p
      )
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formDataImg = new FormData()
      formDataImg.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataImg,
      })

      if (!response.ok) {
        throw new Error('Error al subir imagen')
      }

      const data = await response.json()
      setFormData({ ...formData, image: data.url })
    } catch (err: any) {
      console.error('Error:', err)
      setError('Error al subir imagen: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (selectedProducts.length === 0) {
      setError('Debes agregar al menos un producto al combo')
      setSaving(false)
      return
    }

    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price.toString()) || 0,
        products: selectedProducts.map(p => ({
          variantId: p.variantId,
          quantity: p.quantity,
        })),
      }

      const response = await fetch(`/api/admin/combos/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Error al actualizar combo')
      }

      router.push('/admin/combos')
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
          <span className="text-gray-400">Cargando combo...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/combos"
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Editar Combo</h1>
          <p className="text-gray-400">Modificá los detalles del combo</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Información Básica</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                    Nombre del Combo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                    placeholder="Ej: Kit Iniciación Indoor"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-gray-300 mb-2">
                    Precio del Combo *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all resize-none"
                    placeholder="Descripción del combo..."
                  />
                </div>
              </div>
            </div>

            {/* Productos del combo */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Productos del Combo</h2>
                <button
                  type="button"
                  onClick={() => setShowProductSelector(!showProductSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Producto
                </button>
              </div>

              {/* Product Selector Modal */}
              {showProductSelector && (
                <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-xl">
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredProducts.map((product) =>
                      product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => addProductToCombo(variant, product)}
                          className="w-full flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors text-left"
                        >
                          <div className="relative w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                Sin img
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{product.name}</p>
                            <p className="text-gray-400 text-xs">
                              {variant.sku} - Stock: {variant.stock}
                              {(variant.size || variant.capacity || variant.power) && (
                                <span className="ml-2">
                                  {[variant.size, variant.capacity, variant.power].filter(Boolean).join(' - ')}
                                </span>
                              )}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Selected Products */}
              {selectedProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay productos agregados al combo
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.variantId}
                      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="relative w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                            Sin img
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{product.productName}</p>
                        <p className="text-gray-400 text-xs">{product.sku}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-gray-400 text-sm">Cant:</label>
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) =>
                            updateProductQuantity(product.variantId, parseInt(e.target.value))
                          }
                          className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm text-center focus:outline-none focus:border-green-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProductFromCombo(product.variantId)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Imagen */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Imagen del Combo</h3>

              {formData.image ? (
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                  <Image
                    src={formData.image}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-12 h-12 text-gray-600" />
                </div>
              )}

              <label className="block">
                <span className="sr-only">Subir imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-500 file:text-white
                    hover:file:bg-green-600
                    file:cursor-pointer cursor-pointer"
                />
              </label>
            </div>

            {/* Configuración */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Configuración</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 accent-green-500"
                  />
                  <div>
                    <p className="text-white font-semibold">Activo</p>
                    <p className="text-xs text-gray-400">Visible en la web</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 accent-yellow-500"
                  />
                  <div>
                    <p className="text-white font-semibold">Destacado</p>
                    <p className="text-xs text-gray-400">Mostrar primero</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </>
                )}
              </button>

              <Link
                href="/admin/combos"
                className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl text-center hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
