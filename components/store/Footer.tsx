import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Fade superior */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/0 via-black/50 to-black pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Mobile: Compacto y centrado */}
        <div className="md:hidden text-center space-y-4">
          {/* Logo y nombre */}
          <div className="flex items-center justify-center gap-2">
            <div className="relative w-8 h-8 bg-white rounded-lg p-1">
              <Image
                src="/images/logo.jpg"
                alt="AGRO.GROW Logo"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              AGRO.GROW
            </h3>
          </div>

          {/* Botones sociales */}
          <div className="flex gap-2 justify-center">
            <a
              href="https://www.instagram.com/agro.grow.arg?igsh=cjN4ZXI0NHU5ZzE2&igsi=cjN4ZXI0NHU5ZzE2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:scale-105 rounded-lg transition-all text-xs font-semibold text-white"
            >
              Instagram
            </a>
            <a
              href="https://wa.me/5491136295630"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 hover:scale-105 rounded-lg transition-all text-xs font-semibold text-white"
            >
              WhatsApp
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-500 pt-2 border-t border-gray-800">
            © {new Date().getFullYear()} AGRO.GROW - Buenos Aires, Argentina
          </p>
        </div>

        {/* Desktop: Layout completo */}
        <div className="hidden md:block">
          <div className="grid grid-cols-3 gap-8 mb-6">
            {/* Logo y descripción */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative w-10 h-10 bg-white rounded-lg p-1">
                  <Image
                    src="/images/logo.jpg"
                    alt="AGRO.GROW Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  AGRO.GROW
                </h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                La mejor tecnología para tu cultivo indoor y outdoor.
              </p>

              {/* Social */}
              <div className="flex gap-2">
                <a
                  href="https://www.instagram.com/agro.grow.arg?igsh=cjN4ZXI0NHU5ZzE2&igsi=cjN4ZXI0NHU5ZzE2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:scale-105 rounded-lg transition-all text-xs font-semibold text-white"
                >
                  Instagram
                </a>
                <a
                  href="https://wa.me/5491136295630"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 hover:scale-105 rounded-lg transition-all text-xs font-semibold text-white"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Tienda */}
            <div>
              <h4 className="text-sm font-bold mb-3 text-white">Tienda</h4>
              <ul className="space-y-1.5">
                <FooterLink href="/productos">Productos</FooterLink>
                <FooterLink href="/ofertas">Ofertas</FooterLink>
                <FooterLink href="/contacto">Contacto</FooterLink>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-sm font-bold mb-3 text-white">Contacto</h4>
              <ul className="space-y-2">
                <li>
                  <p className="text-xs text-gray-400">WhatsApp</p>
                  <a href="https://wa.me/5491136295630" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-400 transition-colors text-xs">
                    +54 9 11 3629-5630
                  </a>
                </li>
                <li>
                  <p className="text-xs text-gray-400">Instagram</p>
                  <a href="https://www.instagram.com/agro.grow.arg?igsh=cjN4ZXI0NHU5ZzE2&igsi=cjN4ZXI0NHU5ZzE2" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400 transition-colors text-xs">
                    @agro.grow.arg
                  </a>
                </li>
                <li>
                  <p className="text-xs text-gray-400">Ubicación</p>
                  <p className="text-white text-xs">Buenos Aires, Argentina</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} AGRO.GROW - Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-gray-300 hover:text-green-400 transition-colors text-xs inline-block"
      >
        {children}
      </Link>
    </li>
  )
}
