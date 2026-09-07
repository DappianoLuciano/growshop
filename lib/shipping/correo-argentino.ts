/**
 * Servicio de integración con Correo Argentino
 * Documentación: https://developers.correoargentino.com.ar/
 */

interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface ShipmentRequest {
  remitente: {
    nombre: string
    direccion: string
    localidad: string
    provincia: string
    codigoPostal: string
    telefono: string
  }
  destinatario: {
    nombre: string
    direccion: string
    localidad: string
    provincia: string
    codigoPostal: string
    telefono: string
    email: string
    dni?: string
  }
  paquete: {
    peso: number // en gramos
    alto: number // en cm
    ancho: number // en cm
    largo: number // en cm
    valorDeclarado: number
  }
  servicio: string // 'clasico' | 'express' | 'prioritario'
  referencia?: string
}

interface ShipmentResponse {
  success: boolean
  trackingNumber?: string
  shipmentId?: string
  label?: string // URL de la etiqueta
  cost?: number
  estimatedDelivery?: string
  error?: string
}

interface RateRequest {
  origenCP: string
  destinoCP: string
  peso: number // en gramos
  valorDeclarado: number
}

interface RateResponse {
  success: boolean
  rates?: Array<{
    servicio: string
    precio: number
    diasEntrega: number
  }>
  error?: string
}

class CorreoArgentinoService {
  private apiUrl: string
  private clientId: string
  private clientSecret: string
  private accountNumber: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.apiUrl = process.env.CORREO_ARGENTINO_API_URL || 'https://api.correoargentino.com.ar'
    this.clientId = process.env.CORREO_ARGENTINO_CLIENT_ID || ''
    this.clientSecret = process.env.CORREO_ARGENTINO_CLIENT_SECRET || ''
    this.accountNumber = process.env.CORREO_ARGENTINO_ACCOUNT_NUMBER || ''

    if (!this.clientId || !this.clientSecret || !this.accountNumber) {
      console.warn('⚠️ Credenciales de Correo Argentino no configuradas - usando MODO DEMO')
    }
  }

  /**
   * Verificar si está en modo DEMO (sin credenciales reales)
   */
  private isDemoMode(): boolean {
    return this.clientId === 'demo_client_id' || !this.clientId || this.clientId.includes('demo')
  }

  /**
   * Obtener token de autenticación
   */
  private async authenticate(): Promise<string> {
    // Si tenemos un token válido, lo devolvemos
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        }),
      })

      if (!response.ok) {
        throw new Error(`Error en autenticación: ${response.statusText}`)
      }

      const data: AuthResponse = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // -1 minuto de margen

      return this.accessToken
    } catch (error) {
      console.error('Error al autenticar con Correo Argentino:', error)
      throw error
    }
  }

  /**
   * Obtener tarifas de envío
   */
  async getRates(request: RateRequest): Promise<RateResponse> {
    // MODO DEMO: Devolver tarifas de ejemplo
    if (this.isDemoMode()) {
      console.log('🎭 MODO DEMO: Devolviendo tarifas de ejemplo')
      return {
        success: true,
        rates: [
          {
            servicio: 'clasico',
            precio: 2500,
            diasEntrega: 5
          },
          {
            servicio: 'express',
            precio: 4000,
            diasEntrega: 3
          },
          {
            servicio: 'prioritario',
            precio: 6000,
            diasEntrega: 1
          }
        ]
      }
    }

    // MODO PRODUCCIÓN: API real
    try {
      const token = await this.authenticate()

      const response = await fetch(`${this.apiUrl}/envios/cotizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cuenta: this.accountNumber,
          codigoPostalOrigen: request.origenCP,
          codigoPostalDestino: request.destinoCP,
          peso: request.peso,
          valorDeclarado: request.valorDeclarado,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || 'Error al obtener tarifas',
        }
      }

      const data = await response.json()

      return {
        success: true,
        rates: data.servicios || [],
      }
    } catch (error: any) {
      console.error('Error al obtener tarifas:', error)
      return {
        success: false,
        error: error.message || 'Error al obtener tarifas',
      }
    }
  }

  /**
   * Crear un envío
   */
  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    // MODO DEMO: Generar envío de ejemplo
    if (this.isDemoMode()) {
      console.log('🎭 MODO DEMO: Generando envío de ejemplo')
      const trackingNumber = `AR${Date.now().toString().slice(-9)}`
      const estimatedDelivery = new Date()
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5) // +5 días

      // Simular costo según servicio
      const costos: Record<string, number> = {
        'clasico': 2500,
        'express': 4000,
        'prioritario': 6000
      }
      const cost = costos[request.servicio] || 2500

      return {
        success: true,
        trackingNumber,
        shipmentId: `DEMO-${Date.now()}`,
        label: `https://ejemplo.com/etiquetas/${trackingNumber}.pdf`,
        cost,
        estimatedDelivery: estimatedDelivery.toISOString(),
      }
    }

    // MODO PRODUCCIÓN: API real
    try {
      const token = await this.authenticate()

      const response = await fetch(`${this.apiUrl}/envios/generar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cuenta: this.accountNumber,
          ...request,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || 'Error al crear envío',
        }
      }

      const data = await response.json()

      return {
        success: true,
        trackingNumber: data.numeroSeguimiento,
        shipmentId: data.idEnvio,
        label: data.urlEtiqueta,
        cost: data.costo,
        estimatedDelivery: data.fechaEntregaEstimada,
      }
    } catch (error: any) {
      console.error('Error al crear envío:', error)
      return {
        success: false,
        error: error.message || 'Error al crear envío',
      }
    }
  }

  /**
   * Rastrear un envío
   */
  async trackShipment(trackingNumber: string): Promise<any> {
    try {
      const token = await this.authenticate()

      const response = await fetch(`${this.apiUrl}/envios/tracking/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error al rastrear envío: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error al rastrear envío:', error)
      throw error
    }
  }

  /**
   * Cancelar un envío
   */
  async cancelShipment(shipmentId: string): Promise<boolean> {
    try {
      const token = await this.authenticate()

      const response = await fetch(`${this.apiUrl}/envios/${shipmentId}/cancelar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error('Error al cancelar envío:', error)
      return false
    }
  }
}

export const correoArgentinoService = new CorreoArgentinoService()
export type { ShipmentRequest, ShipmentResponse, RateRequest, RateResponse }
