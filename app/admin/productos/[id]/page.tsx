'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

const getCategoryFields = (slug: string): string[] => {
  const fieldsMap: { [key: string]: string[] } = {
    'fertilizantes': ['capacity'],
    'iluminacion': ['power'],
    'sustratos': ['capacity', 'size'],
    'macetas': ['size', 'capacity'],
    'ventilacion': ['power', 'size'],
    'medicion': [],
  }
  return fieldsMap[slug] || []
}

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    isOnSale: false,
    salePrice: 0,
    stock: 0,
    marca: '',
    sku: '',
    categoryId: '',
    isActive: true,
    isFeatured: false,
    capacity: '',
    size: '',
    power: '',
  })

  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const selectedCategory = categories.find(c => c.id === formData.categoryId)
  const categoryFields = selectedCategory ? getCategoryFields(selectedCategory.slug) : []

  useEffect(() => {
    fetchProduct()
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

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${resolvedParams.id}`)
      if (response.ok) {
        const product = await response.json()
        const variant = product.variants[0]

        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          isOnSale: product.isOnSale || false,
          salePrice: parseFloat(product.salePrice) || 0,
          stock: variant?.stock || 0,
          marca: product.brand || '',
          sku: variant?.sku || '',
          categoryId: product.categoryId || '',
          isActive: product.isActive,
          isFeatured: product.isFeatured || false,
          capacity: variant?.capacity || '',
          size: variant?.size || '',
          power: variant?.power || '',
        })

        // Cargar imágenes existentes ordenadas
        const sortedImages = product.images
          .sort((a: any, b: any) => a.order - b.order)
          .map((img: any) => img.url)
        setImages(sortedImages)
      }
    } catch (error) {
      console.error('Error al cargar producto:', error)
      setError('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Error al subir imagen')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...uploadedUrls])
    } catch (err: any) {
      console.error('Error:', err)
      setError('Error al subir imágenes: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Validar precio de oferta
    if (formData.isOnSale && formData.salePrice) {
      if (formData.salePrice >= formData.price) {
        setError('El precio de oferta debe ser menor que el precio original')
        setSaving(false)
        return
      }
    }

    try {
      const dataToSend = {
        ...formData,
        images: images.map((url, index) => ({
          url,
          alt: formData.name,
          order: index,
        })),
      }

      const response = await fetch(`/api/admin/products/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Error al guardar producto')
      }

      router.push('/admin/productos')
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            <span className="text-gray-400">Cargando producto...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Editar Producto</h1>
          <p className="text-gray-400">Modificá la información del producto</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Información Básica</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Nombre del Producto *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Marca *</label>
                    <input
                      type="text"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">SKU *</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Precio {formData.isOnSale ? 'Original' : ''} *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Oferta Section */}
                <div className="pt-4 border-t border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={formData.isOnSale}
                      onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                      className="w-5 h-5 accent-yellow-500"
                    />
                    <div>
                      <p className="text-white font-semibold">En Oferta 🔥</p>
                      <p className="text-xs text-gray-400">Mostrar este producto en ofertas</p>
                    </div>
                  </label>

                  {formData.isOnSale && (
                    <div>
                      <label className="block text-sm font-semibold text-yellow-400 mb-2">Precio de Oferta *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400">$</span>
                        <input
                          type="number"
                          value={formData.salePrice}
                          onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                          className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-yellow-500/50 rounded-xl text-yellow-400 placeholder-yellow-500/30 focus:outline-none focus:border-yellow-500 transition-all"
                          min="0"
                          step="0.01"
                          required={formData.isOnSale}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Descuento: {formData.price > 0 && formData.salePrice > 0 ?
                          Math.round(((formData.price - formData.salePrice) / formData.price) * 100) : 0}%
                      </p>
                    </div>
                  )}
                </div>
                <div className="hidden">
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Descripción</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {categoryFields.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Características</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryFields.includes('capacity') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Capacidad</label>
                      <input
                        type="text"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                        placeholder="Ej: 1L, 500ml, 5kg"
                      />
                    </div>
                  )}
                  {categoryFields.includes('size') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Tamaño</label>
                      <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                        placeholder="Ej: 20x20cm, M, L"
                      />
                    </div>
                  )}
                  {categoryFields.includes('power') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Potencia</label>
                      <input
                        type="text"
                        value={formData.power}
                        onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                        placeholder="Ej: 600W, 1000W"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Categoría</h2>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all"
                required
              >
                <option value="">Seleccionar categoría *</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Imágenes del Producto</h2>
              <div className="space-y-4">
                {/* Grid de imágenes */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((url, index) => (
                      <div key={index} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group">
                        <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm text-center cursor-pointer transition-all">
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Subiendo...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        {images.length === 0 ? 'Subir Imágenes' : 'Agregar Más Imágenes'}
                      </div>
                    )}
                  </div>
                </label>

                <p className="text-xs text-gray-500">
                  Podés subir múltiples imágenes. La primera será la principal.
                </p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Estado</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 accent-green-500"
                  />
                  <div>
                    <p className="text-white font-semibold">Producto activo</p>
                    <p className="text-xs text-gray-400">Visible en la tienda</p>
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
                    <p className="text-white font-semibold">Producto destacado ⭐</p>
                    <p className="text-xs text-gray-400">Mostrar en sección destacados</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                href="/admin/productos"
                className="block w-full py-3 border-2 border-gray-700 text-gray-300 font-semibold text-center rounded-xl hover:border-gray-600 transition-all"
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
