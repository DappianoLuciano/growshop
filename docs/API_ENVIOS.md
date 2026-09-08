# API de Envíos y Ganancias

Esta documentación describe cómo usar la integración con Correo Argentino para generar envíos y registrar ganancias automáticamente.

## Configuración

### Variables de Entorno

Agregar las siguientes variables a tu archivo `.env`:

```env
# Correo Argentino API
CORREO_ARGENTINO_API_URL="https://api.correoargentino.com.ar"
CORREO_ARGENTINO_CLIENT_ID="tu-client-id"
CORREO_ARGENTINO_CLIENT_SECRET="tu-client-secret"
CORREO_ARGENTINO_ACCOUNT_NUMBER="tu-numero-de-cuenta"
```

## Endpoints Disponibles

### 1. Obtener Tarifas de Envío

**POST** `/api/shipments/rates`

Obtiene las tarifas disponibles para un envío.

**Request:**
```json
{
  "origenCP": "1425",
  "destinoCP": "5000",
  "peso": 1000,
  "valorDeclarado": 15000
}
```

**Response:**
```json
{
  "success": true,
  "rates": [
    {
      "servicio": "clasico",
      "precio": 2500,
      "diasEntrega": 5
    },
    {
      "servicio": "express",
      "precio": 4000,
      "diasEntrega": 3
    },
    {
      "servicio": "prioritario",
      "precio": 6000,
      "diasEntrega": 1
    }
  ]
}
```

### 2. Crear Envío

**POST** `/api/shipments/create`

Genera un envío con Correo Argentino y registra automáticamente el **doble del costo de envío como ganancia**.

**Request:**
```json
{
  "orderId": "clxxx123456",
  "servicio": "clasico",
  "peso": 1000,
  "dimensiones": {
    "alto": 10,
    "ancho": 20,
    "largo": 30
  },
  "remitente": {
    "nombre": "GrowShop",
    "direccion": "Av. Siempre Viva 123",
    "localidad": "Buenos Aires",
    "provincia": "Buenos Aires",
    "codigoPostal": "1425",
    "telefono": "1145678900"
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "clxxx123456",
    "orderNumber": "ORD-1234567890",
    "trackingNumber": "AR123456789",
    "shippingCost": 2500,
    "status": "SHIPPED"
  },
  "shipment": {
    "trackingNumber": "AR123456789",
    "shipmentId": "SHIP-123456",
    "label": "https://correoargentino.com.ar/labels/AR123456789.pdf",
    "cost": 2500,
    "estimatedDelivery": "2026-09-13"
  },
  "profit": {
    "id": "clxxx789012",
    "amount": 5000,
    "description": "Ganancia por envío - Orden ORD-1234567890 (2x $2500)"
  }
}
```

**Notas importantes:**
- La orden debe estar en estado `APPROVED` (pago aprobado)
- El tipo de envío debe ser `SHIPPING` (no `PICKUP`)
- La orden no debe tener ya un tracking number
- Se registra automáticamente el **doble del costo** como ganancia
- El estado de la orden cambia a `SHIPPED`

### 3. Rastrear Envío

**GET** `/api/shipments/track/{trackingNumber}`

Obtiene el estado actual de un envío.

**Response:**
```json
{
  "success": true,
  "tracking": {
    "trackingNumber": "AR123456789",
    "status": "EN_TRANSITO",
    "events": [
      {
        "date": "2026-09-06T10:00:00Z",
        "status": "INGRESADO",
        "location": "Buenos Aires"
      },
      {
        "date": "2026-09-07T14:30:00Z",
        "status": "EN_TRANSITO",
        "location": "Córdoba"
      }
    ]
  }
}
```

### 4. Listar Ganancias

**GET** `/api/profits`

Obtiene el listado de ganancias registradas.

**Query Parameters:**
- `type` - Filtrar por tipo (SHIPPING, PRODUCT_SALE, COMBO_SALE, OTHER)
- `orderId` - Filtrar por ID de orden
- `startDate` - Fecha de inicio (ISO 8601)
- `endDate` - Fecha de fin (ISO 8601)

**Ejemplo:**
```
GET /api/profits?type=SHIPPING&startDate=2026-09-01&endDate=2026-09-30
```

**Response:**
```json
{
  "success": true,
  "profits": [
    {
      "id": "clxxx789012",
      "orderId": "clxxx123456",
      "amount": 5000,
      "description": "Ganancia por envío - Orden ORD-1234567890 (2x $2500)",
      "type": "SHIPPING",
      "createdAt": "2026-09-06T15:30:00Z",
      "order": {
        "orderNumber": "ORD-1234567890",
        "customerName": "Juan Pérez",
        "total": 35000
      }
    }
  ],
  "totals": {
    "total": 25000,
    "shipping": 15000,
    "productSale": 10000,
    "comboSale": 0,
    "other": 0
  },
  "count": 5
}
```

## Sistema de Ganancias

### Tipos de Ganancia

```typescript
enum ProfitType {
  SHIPPING      // Ganancia por envíos
  PRODUCT_SALE  // Ganancia por venta de productos
  COMBO_SALE    // Ganancia por venta de combos
  OTHER         // Otras ganancias
}
```

### Regla del Doble por Ganancia

Cuando se genera un envío:
1. Se llama a la API de Correo Argentino
2. Se obtiene el costo real del envío (ej: $2500)
3. Se actualiza la orden con el tracking number y el costo
4. **Se registra automáticamente el DOBLE del costo como ganancia** (ej: $5000)

Esto significa que si el envío cuesta $2500, se registra una ganancia de $5000.

## Flujo de Uso Completo

1. **Cliente realiza un pedido** → Se crea la orden con estado `PENDING`
2. **Admin aprueba el pago** → Estado cambia a `APPROVED`, se descuenta stock
3. **Admin genera el envío** → 
   - Se llama a `/api/shipments/create`
   - Se crea el envío en Correo Argentino
   - Se actualiza la orden con tracking number
   - Se registra el doble del costo como ganancia
   - Estado cambia a `SHIPPED`
4. **Cliente recibe el tracking** → Puede rastrear el envío
5. **Admin consulta ganancias** → Ve todas las ganancias por envíos

## Modelos de Base de Datos

### Order (actualizado)

```prisma
model Order {
  // ... campos existentes ...
  ocaShipmentId   String?  // ID del envío en Correo Argentino
  ocaTrackingData Json?    // Datos adicionales del tracking
  profits         Profit[] // Relación con ganancias
}
```

### Profit (nuevo)

```prisma
model Profit {
  id          String      @id @default(cuid())
  orderId     String
  amount      Decimal     @db.Decimal(10, 2)
  description String
  type        ProfitType  @default(SHIPPING)
  createdAt   DateTime    @default(now())
  order       Order       @relation(fields: [orderId], references: [id])
}
```

## Ejemplo de Integración en Frontend

```typescript
// Generar envío desde el admin
async function generarEnvio(orderId: string) {
  const response = await fetch('/api/shipments/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId,
      servicio: 'clasico',
      peso: 1000,
      dimensiones: {
        alto: 10,
        ancho: 20,
        largo: 30
      }
    })
  })

  const data = await response.json()
  
  if (data.success) {
    console.log('Envío generado:', data.shipment.trackingNumber)
    console.log('Ganancia registrada:', data.profit.amount)
    // Mostrar etiqueta para imprimir
    window.open(data.shipment.label, '_blank')
  }
}

// Ver ganancias del mes
async function verGananciasDelMes() {
  const startDate = new Date()
  startDate.setDate(1)
  const endDate = new Date()
  
  const response = await fetch(
    `/api/profits?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  )
  
  const data = await response.json()
  console.log('Ganancias totales del mes:', data.totals.total)
  console.log('Ganancias por envíos:', data.totals.shipping)
}
```

## Errores Comunes

### Error: "La orden debe estar aprobada para generar envío"
- **Solución:** Aprobar el pago de la orden primero usando PATCH `/api/orders/{id}` con `paymentStatus: "APPROVED"`

### Error: "Esta orden ya tiene un envío generado"
- **Solución:** Verificar si ya existe un tracking number. No se pueden generar envíos duplicados.

### Error: "Faltan datos de dirección en la orden"
- **Solución:** Asegurarse que la orden tenga `address`, `city`, `province` y `postalCode`

### Error de autenticación con Correo Argentino
- **Solución:** Verificar que las credenciales en `.env` sean correctas
