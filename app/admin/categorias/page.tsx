'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, ChevronDown, ChevronUp, Package } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  brand: string | null
  price: number
  isActive: boolean
  variants: {
    id: string
    stock: number
  }[]
}

interface Category {
  id: string
  name: string
  slug: string
  section: 'GROW' | 'FERRETERIA' | 'ACCESORIOS'
  _count?: {
    products: number
  }
  products?: Product[]
}

const sectionLabels: Record<Category['section'], string> = {
  GROW: 'Productos Grow',
  FERRETERIA: 'Ferretería',
  ACCESORIOS: 'Accesorios',
}

const sectionStyles: Record<Category['section'], string> = {
  GROW: 'bg-green-500/20 text-green-400',
  FERRETERIA: 'bg-orange-500/20 text-orange-400',
  ACCESORIOS: 'bg-blue-500/20 text-blue-400',
}

export default function CategoriasAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [loadingProducts, setLoadingProducts] = useState<string | null>(null)
  const [sectionFilter, setSectionFilter] = useState<'ALL' | Category['section']>('ALL')

  const filteredCategories = sectionFilter === 'ALL'
    ? categories
    : categories.filter((c) => c.section === sectionFilter)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/admin/categories')
        if (response.ok) {
          const data = await response.json()
          console.log('📦 Categorías:', data)
          setCategories(data)
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const toggleCategory = async (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null)
      return
    }

    // Si la categoría ya tiene productos cargados, solo expandir
    const category = categories.find(c => c.id === categoryId)
    if (category?.products) {
      setExpandedCategory(categoryId)
      return
    }

    // Cargar productos de la categoría
    setLoadingProducts(categoryId)
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(categories.map(c =>
          c.id === categoryId ? { ...c, products: data.products } : c
        ))
        setExpandedCategory(categoryId)
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setLoadingProducts(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id))
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al eliminar categoría')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar la categoría')
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            <span className="text-gray-400">Cargando categorías...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Categorías</h1>
          <p className="text-gray-400">Organizá tus productos por categoría</p>
        </div>
        <Link
          href="/admin/categorias/nueva"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </Link>
      </div>

      {/* Filtro por sección */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['ALL', 'GROW', 'FERRETERIA', 'ACCESORIOS'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSectionFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              sectionFilter === s
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {s === 'ALL' ? 'Todas' : sectionLabels[s]}
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCategories.map((categoria) => {
          const isExpanded = expandedCategory === categoria.id
          const isLoading = loadingProducts === categoria.id
          const hasProducts = (categoria._count?.products || 0) > 0

          return (
            <div
              key={categoria.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-green-500/50 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{categoria.name}</h3>
                      <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-lg">
                        /{categoria.slug}
                      </div>
                      <div className={`text-xs font-semibold px-3 py-1 rounded-lg ${sectionStyles[categoria.section]}`}>
                        {sectionLabels[categoria.section]}
                      </div>
                    </div>
                    <button
                      onClick={() => hasProducts && toggleCategory(categoria.id)}
                      disabled={!hasProducts}
                      className={`flex items-center gap-2 text-sm ${
                        hasProducts
                          ? 'text-gray-400 hover:text-green-400 cursor-pointer'
                          : 'text-gray-600 cursor-not-allowed'
                      } transition-colors`}
                    >
                      <Package className="w-4 h-4" />
                      <span>{categoria._count?.products || 0} productos</span>
                      {hasProducts && (
                        isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/categorias/${categoria.id}`}
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(categoria.id, categoria.name)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products List */}
              {isExpanded && (
                <div className="border-t border-gray-800 bg-gray-900/50">
                  {isLoading ? (
                    <div className="p-6 flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                      <span className="text-gray-400">Cargando productos...</span>
                    </div>
                  ) : categoria.products && categoria.products.length > 0 ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoria.products.map((product) => {
                          const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
                          return (
                            <Link
                              key={product.id}
                              href={`/admin/productos/${product.id}`}
                              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500/50 transition-all"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-white text-sm line-clamp-1">
                                  {product.name}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    product.isActive
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-gray-700 text-gray-400'
                                  }`}
                                >
                                  {product.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>
                              {product.brand && (
                                <p className="text-xs text-gray-400 mb-2">{product.brand}</p>
                              )}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-green-400 font-bold">
                                  ${parseFloat(product.price.toString()).toLocaleString('es-AR')}
                                </span>
                                <span className="text-gray-400">
                                  Stock: {totalStock}
                                </span>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No hay productos en esta categoría
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
