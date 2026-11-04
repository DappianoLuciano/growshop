import { describe, expect, it } from 'vitest'
import { buildGoogleMerchantFeed, comboToItem, htmlToText, productToItems, type FeedProduct } from './google-merchant'

const variant = (over: Partial<FeedProduct['variants'][number]> = {}) => ({
  id: 'v1',
  sku: null,
  size: null,
  capacity: null,
  power: null,
  stock: 5,
  price: null,
  ...over,
})

const product = (over: Partial<FeedProduct> = {}): FeedProduct => ({
  id: 'p1',
  name: 'Sustrato Premium',
  brand: 'Marca',
  slug: 'sustrato-premium',
  description: '<p>Sustrato <strong>orgánico</strong></p>',
  price: 1000,
  isOnSale: false,
  salePrice: null,
  images: [{ url: 'https://res.cloudinary.com/a.jpg' }, { url: 'https://res.cloudinary.com/b.jpg' }],
  category: { name: 'Sustratos', section: 'GROW' },
  variants: [variant()],
  ...over,
})

describe('productToItems', () => {
  it('genera los campos obligatorios', () => {
    const [item] = productToItems(product())
    expect(item).toMatchObject({
      'g:id': 'v1',
      'g:title': 'Sustrato Premium',
      'g:description': 'Sustrato orgánico',
      'g:link': 'https://agrogrowarg.com/productos/sustrato-premium',
      'g:image_link': 'https://res.cloudinary.com/a.jpg',
      'g:additional_image_link': ['https://res.cloudinary.com/b.jpg'],
      'g:availability': 'in_stock',
      'g:price': '1000.00 ARS',
      'g:condition': 'new',
      'g:google_product_category': '2962',
    })
    expect(item['g:item_group_id']).toBeUndefined()
  })

  it('agrupa variantes y usa el precio de cada una', () => {
    const items = productToItems(
      product({ variants: [variant({ id: 'a', size: '10L' }), variant({ id: 'b', size: '50L', price: 3000, stock: 0 })] })
    )
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({ 'g:item_group_id': 'p1', 'g:title': 'Sustrato Premium - 10L', 'g:price': '1000.00 ARS' })
    expect(items[1]).toMatchObject({ 'g:price': '3000.00 ARS', 'g:availability': 'out_of_stock' })
  })

  it('informa la oferta solo si es menor al precio', () => {
    const [item] = productToItems(product({ isOnSale: true, salePrice: 800 }))
    expect(item['g:sale_price']).toBe('800.00 ARS')
    const [noSale] = productToItems(product({ isOnSale: true, salePrice: 1500 }))
    expect(noSale['g:sale_price']).toBeUndefined()
  })

  it('omite productos sin imagen', () => {
    expect(productToItems(product({ images: [] }))).toEqual([])
  })

  it('marca sin identificadores si falta marca o SKU', () => {
    expect(productToItems(product())[0]['g:identifier_exists']).toBe('no')
    expect(productToItems(product({ variants: [variant({ sku: 'SKU1' })] }))[0]['g:identifier_exists']).toBeUndefined()
  })
})

describe('comboToItem', () => {
  it('marca el combo como bundle', () => {
    const item = comboToItem({ id: 'c1', name: 'Combo', slug: 'combo', description: null, price: 5000, image: 'https://x/c.jpg', available: false })
    expect(item).toMatchObject({ 'g:id': 'combo-c1', 'g:is_bundle': 'yes', 'g:availability': 'out_of_stock' })
  })
})

describe('buildGoogleMerchantFeed', () => {
  it('escapa caracteres especiales en el XML', () => {
    const xml = buildGoogleMerchantFeed([product({ name: 'Maceta 10 & 20 <cm>' })], [])
    expect(xml).toContain('<g:title>Maceta 10 &amp; 20 &lt;cm&gt;</g:title>')
    expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"')
  })
})

describe('htmlToText', () => {
  it('convierte HTML del editor a texto plano', () => {
    expect(htmlToText('<p>Hola&nbsp;mundo</p><ul><li>uno</li><li>dos</li></ul>')).toBe('Hola mundo\nuno\ndos')
  })
})
