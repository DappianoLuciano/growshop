import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/login', '/carrito', '/checkout', '/orden', '/pedido-confirmado'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
