import { SITE_NAME, SITE_URL } from '@/lib/site'

/**
 * Feed de productos para Google Merchant Center (RSS 2.0 + namespace g:).
 * Especificación: https://support.google.com/merchants/answer/7052112
 *
 * Una entrada por variante activa. Si un producto tiene varias variantes,
 * comparten item_group_id para que Google las agrupe.
 */

const CURRENCY = 'ARS'

// Taxonomía de Google por sección de la tienda
// https://www.google.com/basepages/producttype/taxonomy-with-ids.es-ES.txt
const GOOGLE_CATEGORY_BY_SECTION: Record<string, string | undefined> = {
  GROW: '2962', // Casa y jardín > Césped y jardín > Jardinería
  FERRETERIA: '632', // Ferretería
}

const MAX_ADDITIONAL_IMAGES = 10
const MAX_TITLE = 150
const MAX_DESCRIPTION = 5000

type Num = { toNumber(): number } | number | null | undefined

export type FeedProduct = {
  id: string
  name: string
  brand: string | null
  slug: string
  description: string | null
  price: Num
  isOnSale: boolean
  salePrice: Num
  images: { url: string }[]
  category: { name: string; section: string } | null
  variants: {
    id: string
    sku: string | null
    size: string | null
    capacity: string | null
    power: string | null
    stock: number
    price: Num
  }[]
}

export type FeedCombo = {
  id: string
  name: string
  slug: string
  description: string | null
  price: Num
  image: string | null
  available: boolean
}

type FeedItem = Record<string, string | string[] | undefined>

const toNumber = (n: Num) => (n == null ? null : typeof n === 'number' ? n : n.toNumber())
const formatPrice = (n: number) => `${n.toFixed(2)} ${CURRENCY}`

export function htmlToText(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<\s*(br|\/p|\/li|\/h[1-6]|\/div)\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim()
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Caracteres de control no válidos en XML
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
}

const truncate = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s)

function variantLabel(v: FeedProduct['variants'][number]): string {
  return [v.size, v.capacity, v.power].filter(Boolean).join(' / ')
}

export function productToItems(product: FeedProduct): FeedItem[] {
  const [mainImage, ...extraImages] = product.images
  const basePrice = toNumber(product.price)
  // Google rechaza productos sin imagen o sin precio
  if (!mainImage || basePrice == null) return []

  const link = `${SITE_URL}/productos/${product.slug}`
  const description = truncate(htmlToText(product.description) || product.name, MAX_DESCRIPTION)
  const salePrice = product.isOnSale ? toNumber(product.salePrice) : null
  const hasGroup = product.variants.length > 1
  const variants = product.variants.length > 0 ? product.variants : [null]

  return variants.map((variant) => {
    const regular = toNumber(variant?.price) ?? basePrice
    const label = variant ? variantLabel(variant) : ''
    const title = truncate(label && hasGroup ? `${product.name} - ${label}` : product.name, MAX_TITLE)
    const onSale = salePrice != null && salePrice > 0 && salePrice < regular

    return {
      'g:id': variant?.sku || variant?.id || product.id,
      'g:item_group_id': hasGroup ? product.id : undefined,
      'g:title': title,
      'g:description': description,
      'g:link': link,
      'g:image_link': mainImage.url,
      'g:additional_image_link': extraImages.slice(0, MAX_ADDITIONAL_IMAGES).map((i) => i.url),
      'g:availability': variant && variant.stock > 0 ? 'in_stock' : 'out_of_stock',
      'g:price': formatPrice(regular),
      'g:sale_price': onSale ? formatPrice(salePrice) : undefined,
      'g:condition': 'new',
      'g:brand': product.brand || undefined,
      'g:mpn': variant?.sku || undefined,
      'g:identifier_exists': product.brand && variant?.sku ? undefined : 'no',
      'g:product_type': product.category?.name,
      'g:google_product_category': product.category
        ? GOOGLE_CATEGORY_BY_SECTION[product.category.section]
        : undefined,
      'g:size': variant?.size || undefined,
    }
  })
}

export function comboToItem(combo: FeedCombo): FeedItem | null {
  const price = toNumber(combo.price)
  if (!combo.image || price == null) return null

  return {
    'g:id': `combo-${combo.id}`,
    'g:title': truncate(combo.name, MAX_TITLE),
    'g:description': truncate(htmlToText(combo.description) || combo.name, MAX_DESCRIPTION),
    'g:link': `${SITE_URL}/combos/${combo.slug}`,
    'g:image_link': combo.image,
    'g:availability': combo.available ? 'in_stock' : 'out_of_stock',
    'g:price': formatPrice(price),
    'g:condition': 'new',
    'g:brand': SITE_NAME,
    'g:identifier_exists': 'no',
    'g:is_bundle': 'yes',
    'g:product_type': 'Combos',
  }
}

function itemToXml(item: FeedItem): string {
  const fields = Object.entries(item).flatMap(([tag, value]) => {
    if (value === undefined || value === '') return []
    const values = Array.isArray(value) ? value : [value]
    return values.map((v) => `      <${tag}>${escapeXml(v)}</${tag}>`)
  })
  return `    <item>\n${fields.join('\n')}\n    </item>`
}

export function buildGoogleMerchantFeed(products: FeedProduct[], combos: FeedCombo[]): string {
  const items = [
    ...products.flatMap(productToItems),
    ...combos.map(comboToItem).filter((i): i is FeedItem => i !== null),
  ]

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    `    <title>${escapeXml(SITE_NAME)}</title>`,
    `    <link>${SITE_URL}</link>`,
    `    <description>${escapeXml(`Productos de ${SITE_NAME}`)}</description>`,
    ...items.map(itemToXml),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
