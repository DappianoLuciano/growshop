import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/store/cart-context";
import { SITE_URL } from "@/lib/site";

// Usar fuente del sistema para builds standalone (Electron)
const spaceGrotesk = {
  variable: '--font-space-grotesk',
  className: ''
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AgroGrow - Insumos para Cultivo Indoor & Outdoor",
    template: "%s | AgroGrow",
  },
  description: "Tienda online de insumos para cultivo. Fertilizantes, sustratos, iluminación y más. Envíos a todo el país.",
  keywords: "growshop, cultivo, fertilizantes, sustratos, iluminación, indoor, outdoor, hidroponía, agrogrow",
  authors: [{ name: "AgroGrow" }],
  openGraph: {
    title: "AgroGrow - Insumos para Cultivo",
    description: "Tienda online de insumos para cultivo. Fertilizantes, sustratos, iluminación y más.",
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "AgroGrow",
  },
  verification: {
    google: "LdTzes34vn3fp_NZR67-ra6tlGQOuILEBY1fRvPS5K8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-space-grotesk), system-ui, -apple-system, sans-serif' }}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
