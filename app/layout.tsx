import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/store/cart-context";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "GrowShop - Insumos para Cultivo Indoor & Outdoor",
  description: "Tienda online de insumos para cultivo. Fertilizantes, sustratos, iluminación y más. Envíos a todo el país.",
  keywords: "growshop, cultivo, fertilizantes, sustratos, iluminación, indoor, outdoor, hidroponía",
  authors: [{ name: "GrowShop" }],
  openGraph: {
    title: "GrowShop - Insumos para Cultivo",
    description: "Tienda online de insumos para cultivo. Fertilizantes, sustratos, iluminación y más.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
