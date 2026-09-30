'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { errorMessage } from '@/lib/utils/error-message'

export default function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#10b981',
    section: 'GROW',
    imageFit: 'COVER',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await fetch(`/api/admin/categories/${resolvedParams.id}`)
        if (response.ok) {
          const category = await response.json()
          setFormData({
            name: category.name || '',
            description: category.description || '',
            color: category.color || '#10b981',
            section: category.section || 'GROW',
            imageFit: category.imageFit || 'COVER',
          })
        } else {
          setError('Categoría no encontrada')
        }
      } catch (error) {
        console.error('Error al cargar categoría:', error)
        setError('Error al cargar la categoría')
      } finally {
        setLoading(false)
      }
    }
    fetchCategory()
  }, [resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/categories/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar categoría')
      }

      router.push('/admin/categorias')
    } catch (err) {
      console.error('Error:', err)
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar "${formData.name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${resolvedParams.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/categorias')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al eliminar categoría')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al eliminar la categoría')
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            <span className="text-gray-400">Cargando categoría...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categorias" className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Editar Categoría</h1>
          <p className="text-gray-400">Modificá la información de la categoría</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-6">Información de la Categoría</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Sección *
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all"
                >
                  <option value="GROW">Productos Grow</option>
                  <option value="FERRETERIA">Ferretería</option>
                  <option value="ACCESORIOS">Accesorios</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Define en qué sección de la tienda aparece esta categoría
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Ajuste de las fotos
                </label>
                <select
                  value={formData.imageFit}
                  onChange={(e) => setFormData({ ...formData, imageFit: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all"
                >
                  <option value="COVER">Rellenar (recorta la foto para llenar el cuadro)</option>
                  <option value="CONTAIN">Ajustar completa (se ve la foto entera, sin recortar)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Usá &quot;Ajustar completa&quot; para categorías con fotos que no son cuadradas (ej. lentes)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all resize-none"
                  placeholder="Descripción opcional de la categoría"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-semibold text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                      placeholder="#10b981"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-700"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Color para identificar la categoría en la tienda
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 font-bold rounded-xl transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <Link
              href="/admin/categorias"
              className="px-6 py-3 border-2 border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-gray-600 transition-all flex items-center justify-center"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
