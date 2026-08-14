'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar envío del formulario
    console.log('Formulario enviado:', formData)
  }

  return (
    <div className="relative bg-black min-h-screen">
      {/* Efectos de fondo */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-black to-black animate-gradient-shift -z-10"></div>
      <div className="fixed inset-0 opacity-20 -z-10">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
      </div>

      {/* Contenido */}
      <div className="relative pt-28 pb-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 mb-4">
              Contactanos
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              ¿Tenés alguna consulta? Estamos acá para ayudarte
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de contacto */}
            <div className="space-y-8">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Email</h3>
                    <a href="mailto:info@agrogrow.com" className="text-gray-400 hover:text-green-400 transition-colors">
                      info@agrogrow.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">WhatsApp</h3>
                    <a href="tel:+5491112345678" className="text-gray-400 hover:text-green-400 transition-colors">
                      +54 9 11 1234-5678
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Ubicación</h3>
                    <p className="text-gray-400">
                      Buenos Aires, Argentina
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Envianos un mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                    placeholder="Contanos en qué podemos ayudarte..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-green-500/50"
                >
                  <Send className="w-5 h-5" />
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
