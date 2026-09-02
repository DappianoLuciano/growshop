'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ComboProduct {
  id: string
  quantity: number
  variant: {
    product: {
      name: string
      images: {
        url: string
        alt: string | null
      }[]
    }
  }
}

interface Combo {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  isActive: boolean
  isFeatured: boolean
  products: ComboProduct[]
}

export default function CombosAdminPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCombos()
  }, [])

  const fetchCombos = async () => {
    try {
      const response = await fetch('/api/admin/combos')
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Combos recibidos:', data)
        setCombos(data)
      }
    } catch (error) {
      console.error('Error al cargar combos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCombos = combos.filter(combo =>
    combo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    combo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/combos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCombos(combos.filter(c => c.id !== id))
      } else {
        alert('Error al eliminar el combo')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el combo')
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Combos</h1>
          <p className="text-gray-400">Administrá tus combos de productos</p>
        </div>
        <Link
          href="/admin/combos/nuevo"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Combo
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar combos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
          />
        </div>
      </div>

      {/* Combos List */}
      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            <span className="text-gray-400">Cargando combos...</span>
          </div>
        </div>
      ) : filteredCombos.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold mb-1">
                {searchQuery ? 'No se encontraron combos' : 'No hay combos'}
              </p>
              <p className="text-gray-400 text-sm">
                {searchQuery ? 'Intentá con otra búsqueda' : 'Creá tu primer combo para empezar'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Combo</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Productos</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Precio</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Estado</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCombos.map((combo) => (
                    <tr key={combo.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {combo.image ? (
                              <Image
                                src={combo.image}
                                alt={combo.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{combo.name}</p>
                            {combo.description && (
                              <p className="text-gray-400 text-sm line-clamp-1">{combo.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">
                          {combo.products.length} producto{combo.products.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-semibold">
                          ${parseFloat(combo.price.toString()).toLocaleString('es-AR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center ${
                            combo.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {combo.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          {combo.isFeatured && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center bg-yellow-500/20 text-yellow-400">
                              Destacado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/combos/${combo.id}`}
                            className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(combo.id, combo.name)}
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
          <div className="lg:hidden space-y-3">
            {filteredCombos.map((combo) => (
              <div
                key={combo.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-green-500/50 transition-all"
              >
                <div className="flex gap-3 mb-3">
                  <div className="relative w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {combo.image ? (
                      <Image
                        src={combo.image}
                        alt={combo.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{combo.name}</h3>
                    {combo.description && (
                      <p className="text-gray-400 text-xs mb-1 line-clamp-1">{combo.description}</p>
                    )}
                    <div className="flex gap-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        combo.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {combo.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      {combo.isFeatured && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                          Destacado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-3">
                  <div>
                    <p className="text-gray-400 mb-0.5">Precio</p>
                    <p className="text-white font-bold">
                      ${parseFloat(combo.price.toString()).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 mb-0.5">Productos</p>
                    <p className="text-white font-bold">
                      {combo.products.length}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/combos/${combo.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg active:scale-95 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(combo.id, combo.name)}
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
      {!loading && combos.length > 0 && (
        <div className="mt-4 text-sm text-gray-400">
          Mostrando {filteredCombos.length} de {combos.length} combos
        </div>
      )}
    </div>
  )
}
