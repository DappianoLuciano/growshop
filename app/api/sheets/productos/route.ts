import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { timingSafeEqual } from 'crypto'

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

// Endpoint para Google Sheets
// GET /api/sheets/productos  con header "x-api-key: <SHEETS_API_KEY>"  (o ?key= por compatibilidad)
export async function GET(request: Request) {
  try {
    // Sin clave por defecto: si SHEETS_API_KEY no está configurada, el endpoint queda cerrado
    const validKey = process.env.SHEETS_API_KEY
    if (!validKey || validKey.length < 16) {
      console.error('SHEETS_API_KEY no configurada (o de menos de 16 caracteres)')
      return NextResponse.json({ error: 'Endpoint no configurado' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const apiKey = request.headers.get('x-api-key') || searchParams.get('key') || ''

    if (!safeEqual(apiKey, validKey)) {
      return NextResponse.json(
        { error: 'Clave de API inválida' },
        { status: 401 }
      )
    }

    // Obtener todos los productos con sus variantes
    const products = await prisma.product.findMany({
      where: {
        isActive: true // Solo productos activos
      },
      include: {
        variants: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            sku: true,
            size: true,
            capacity: true,
            power: true,
            stock: true,
            price: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Formatear datos para Google Sheets
    const formattedData = products.flatMap(product => {
      // Si no tiene variantes, mostrar el producto sin variante
      if (product.variants.length === 0) {
        return [{
          producto: product.name,
          marca: product.brand || '',
          categoria: product.category?.name || '',
          precio: Number(product.price),
          enOferta: product.isOnSale ? 'Sí' : 'No',
          precioOferta: product.salePrice ? Number(product.salePrice) : '',
          sku: '',
          variante: '',
          stock: 0,
          stockTotal: 0,
          ultimaActualizacion: new Date().toISOString()
        }]
      }

      // Calcular stock total del producto
      const stockTotal = product.variants.reduce((sum, v) => sum + v.stock, 0)

      // Crear una fila por cada variante
      return product.variants.map(variant => {
        // Construir descripción de variante
        const varianteParts = []
        if (variant.size) varianteParts.push(variant.size)
        if (variant.capacity) varianteParts.push(variant.capacity)
        if (variant.power) varianteParts.push(variant.power)
        const varianteDescripcion = varianteParts.join(' - ') || 'Estándar'

        return {
          producto: product.name,
          marca: product.brand || '',
          categoria: product.category?.name || '',
          precio: Number(product.price),
          enOferta: product.isOnSale ? 'Sí' : 'No',
          precioOferta: product.salePrice ? Number(product.salePrice) : '',
          sku: variant.sku || '',
          variante: varianteDescripcion,
          stock: variant.stock,
          stockTotal: stockTotal,
          ultimaActualizacion: new Date().toISOString()
        }
      })
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalProductos: products.length,
      totalVariantes: formattedData.length,
      data: formattedData
    })

  } catch (error) {
    console.error('Error en endpoint de Google Sheets:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}
