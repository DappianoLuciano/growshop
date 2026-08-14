import Link from 'next/link'

const categories = [
  {
    name: 'Fertilizantes',
    description: 'Nutrición completa para todas las etapas de cultivo',
    gradient: 'from-blue-500 to-blue-600',
    count: 0
  },
  {
    name: 'Iluminación',
    description: 'Tecnología LED de última generación',
    gradient: 'from-yellow-500 to-orange-500',
    count: 0
  },
  {
    name: 'Sustratos',
    description: 'Medios de cultivo premium para mejores resultados',
    gradient: 'from-green-600 to-green-700',
    count: 0
  },
  {
    name: 'Macetas',
    description: 'Contenedores profesionales de todos los tamaños',
    gradient: 'from-amber-600 to-amber-700',
    count: 0
  },
  {
    name: 'Ventilación',
    description: 'Control de clima y circulación de aire óptima',
    gradient: 'from-cyan-500 to-cyan-600',
    count: 0
  },
  {
    name: 'Medición',
    description: 'Equipos de precisión para monitoreo constante',
    gradient: 'from-purple-500 to-purple-600',
    count: 0
  },
]

export default function CategoriasPage() {
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
              Categorías
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Explorá nuestro catálogo organizado por categoría
            </p>
          </div>

          {/* Grid de categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/productos?categoria=${category.name.toLowerCase()}`}
                className="group"
              >
                <div className={`relative h-64 rounded-xl overflow-hidden bg-gradient-to-br ${category.gradient} p-8 flex flex-col justify-between transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20`}>
                  {/* Overlay oscuro */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>

                  {/* Contenido */}
                  <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white mb-2">
                      {category.name}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {category.description}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-white/80 text-sm">
                      {category.count} productos
                    </span>
                    <svg
                      className="w-6 h-6 text-white transform group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
