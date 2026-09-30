'use client'

import { useState } from 'react'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NuevaCategoriaPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#10b981', // Verde por defecto
    section: 'GROW',
    imageFit: 'COVER',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Error al guardar categoría')
      }

      const category = await response.json()
      console.log('✅ Categoría creada:', category)

      router.push('/admin/categorias')
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/categorias"
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Nueva Categoría</h1>
          <p className="text-gray-400">Creá una nueva categoría de productos</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl">
          {/* Card principal */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all"
                  placeholder="Ej: Fertilizantes"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  El slug se generará automáticamente a partir del nombre
                </p>
              </div>

              <div>
                <label htmlFor="section" className="block text-sm font-semibold text-gray-300 mb-2">
                  Sección *
                </label>
                <select
                  id="section"
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
                <label htmlFor="imageFit" className="block text-sm font-semibold text-gray-300 mb-2">
                  Ajuste de las fotos
                </label>
                <select
                  id="imageFit"
                  value={formData.imageFit}
                  onChange={(e) => setFormData({ ...formData, imageFit: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all"
                >
                  <option value="COVER">Rellenar (recorta la foto para llenar el cuadro)</option>
                  <option value="CONTAIN">Ajustar completa (se ve la foto entera, sin recortar)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Usá "Ajustar completa" para categorías con fotos que no son cuadradas (ej. lentes)
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all resize-none"
                  placeholder="Descripción breve de la categoría..."
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

          {/* Acciones */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Categoría
                </>
              )}
            </button>
            <Link
              href="/admin/categorias"
              className="flex-1 py-3 border-2 border-gray-700 text-gray-300 font-semibold text-center rounded-xl hover:border-gray-600 transition-all"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
