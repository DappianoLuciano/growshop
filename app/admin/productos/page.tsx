'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  brand: string | null
  price: number
  isOnSale: boolean
  salePrice: number | null
  isActive: boolean
  category: {
    id: string
    name: string
  } | null
  images: {
    url: string
    alt: string | null
  }[]
  variants: {
    stock: number
  }[]
}

export default function ProductosAdminPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Productos recibidos:', data)
        setProducts(data)
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTotalStock = (product: Product) => {
    return product.variants.reduce((total, variant) => total + variant.stock, 0)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Actualizar la lista eliminando el producto
        setProducts(products.filter(p => p.id !== id))
      } else {
        alert('Error al eliminar el producto')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el producto')
    }
  }

  return (
    <div className="p-6 md:p-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Productos</h1>
          <p className="text-gray-400">Administrá tu catálogo de productos</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
          />
        </div>
      </div>

      {/* Products List - Desktop Table / Mobile Cards */}
      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            <span className="text-gray-400">Cargando productos...</span>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold mb-1">
                {searchQuery ? 'No se encontraron productos' : 'No hay productos'}
              </p>
              <p className="text-gray-400 text-sm">
                {searchQuery ? 'Intentá con otra búsqueda' : 'Creá tu primer producto para empezar'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">Producto</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">Categoría</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">Precio</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">Stock</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-300">Estado</th>
                    <th className="px-6 py-5 text-right text-sm font-bold text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                Sin img
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{product.name}</p>
                            {product.brand && (
                              <p className="text-gray-400 text-sm">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-gray-300">
                          {product.category?.name || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {product.isOnSale && product.salePrice ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Original:</span>
                              <span className="text-sm text-gray-400 line-through">
                                ${parseFloat(product.price.toString()).toLocaleString('es-AR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-yellow-400">Oferta:</span>
                              <span className="text-white font-semibold">
                                ${parseFloat(product.salePrice.toString()).toLocaleString('es-AR')}
                              </span>
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">
                                -{Math.round(((parseFloat(product.price.toString()) - parseFloat(product.salePrice.toString())) / parseFloat(product.price.toString())) * 100)}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-white font-semibold">
                            ${parseFloat(product.price.toString()).toLocaleString('es-AR')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-sm font-semibold ${
                          getTotalStock(product) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {getTotalStock(product)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/productos/${product.id}`}
                            className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-green-500/50 transition-all"
              >
                <div className="flex gap-3 mb-3">
                  <div className="relative w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        Sin img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                    {product.brand && (
                      <p className="text-gray-400 text-xs mb-1">{product.brand}</p>
                    )}
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      product.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-3">
                  <div>
                    <p className="text-gray-400 mb-0.5">Precio</p>
                    {product.isOnSale && product.salePrice ? (
                      <div className="flex items-center gap-1.5">
                        <p className="text-white font-bold">
                          ${parseFloat(product.salePrice.toString()).toLocaleString('es-AR')}
                        </p>
                        <span className="px-1 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">
                          -{Math.round(((parseFloat(product.price.toString()) - parseFloat(product.salePrice.toString())) / parseFloat(product.price.toString())) * 100)}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-white font-bold">
                        ${parseFloat(product.price.toString()).toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 mb-0.5">Stock</p>
                    <p className={`font-bold ${
                      getTotalStock(product) > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {getTotalStock(product)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 mb-0.5">Cat.</p>
                    <p className="text-white text-xs truncate max-w-[80px]">
                      {product.category?.name || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg active:scale-95 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="px-3 py-2 bg-gray-800 active:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Stats */}
      {!loading && products.length > 0 && (
        <div className="mt-4 text-sm text-gray-400">
          Mostrando {filteredProducts.length} de {products.length} productos
        </div>
      )}
    </div>
  )
}
