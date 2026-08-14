# 📋 PROYECTO GROWSHOP E-COMMERCE - DOCUMENTACIÓN COMPLETA

## 🎯 Objetivo del Proyecto

Crear un e-commerce completo y funcional para GrowShop, negocio de insumos para cultivo indoor y outdoor, que permita:
- Vender productos online con envíos a todo el país
- Gestionar productos fácilmente desde un panel de admin
- Procesar pagos con Mercado Pago y transferencias
- Ofrecer retiro en local y envíos a domicilio
- Sistema de variantes por capacidad, tamaño y potencia según tipo de producto

## 🏢 Información del Negocio

- **Nombre**: GrowShop
- **Rubro**: Insumos para cultivo (indoor/outdoor)
- **Productos principales**:
  - Fertilizantes y nutrientes
  - Sustratos y tierras
  - Iluminación (LED, HPS)
  - Macetas y contenedores
  - Sistemas de riego
  - Equipos de medición (pH, EC, temperatura)
  - Carpas de cultivo
  - Extractores y ventilación
  - Accesorios y herramientas

## 🎨 Identidad Visual

### Paleta de Colores
```css
Verde principal:     #4ade80
Verde oscuro:        #22c55e
Marrón tierra:       #92400e
Marrón claro:        #a8a29e
Blanco:              #ffffff
Gris claro fondo:    #f5f5f4
Gris bordes:         #e7e5e4
Texto principal:     #1c1917
Texto secundario:    #78716c
```

### Estilo
- Moderno y natural
- Mobile-first (prioridad diseño móvil)
- Tipografía sans-serif (Inter)
- Paleta inspirada en naturaleza (verdes, marrones tierra)
- Iconos de plantas y naturaleza
- Fotografía de productos limpia y profesional

## 🗄️ Arquitectura de Base de Datos

### Modelos Principales

#### Users (Administradores)
- Sistema de autenticación con NextAuth
- Roles: ADMIN, SUPER_ADMIN
- Email + Password hasheada con bcrypt

#### Products (Productos)
- Información básica: nombre, slug, descripción, precio, marca
- Relación con categorías
- Múltiples imágenes
- Variantes según tipo de producto
- Control de stock por variante
- Featured/Destacados para home

#### ProductVariant (Variantes)
Atributos dinámicos según tipo de producto:
- **Capacidad**: Para líquidos (250ml, 1L, 5L, 10L, 20L)
- **Tamaño**: Para macetas/carpas (Pequeño, Mediano, Grande, XL)
- **Potencia**: Para iluminación (150W, 300W, 600W, 1000W)
- **Specs**: Campo JSON para especificaciones adicionales
- Stock individual
- Precio opcional diferente
- SKU único

#### Category (Categorías)
Ejemplos:
- Fertilizantes (Base, Bloom, Aditivos)
- Sustratos (Tierra, Coco, Perlita, Vermiculita)
- Iluminación (LED, HPS, CFL)
- Macetas (Plástico, Tela, Air-Pot)
- Medición (pH, EC, Termómetros)
- Carpas (60x60, 80x80, 120x120, 240x120)
- Ventilación (Extractores, Intractores, Filtros)

#### Orders (Pedidos)
- Número de orden único
- Datos del cliente
- Tipo de envío: PICKUP (retiro) / SHIPPING (envío)
- Dirección de envío (opcional)
- Método de pago: MERCADO_PAGO / TRANSFER / CASH
- Estados: PENDING → CONFIRMED → PREPARING → READY → SHIPPED → DELIVERED
- Items del pedido (snapshot con capacity/size/power)

## 🔧 Stack Técnico Detallado

### Frontend
- **Framework**: Next.js 16 con App Router
- **React**: v19
- **Styling**: Tailwind CSS v4
- **TypeScript**: Full typing
- **Icons**: Lucide React
- **Fonts**: Inter

### Backend
- **API**: Next.js API Routes
- **ORM**: Prisma v7
- **Validación**: Zod + prisma-zod-generator
- **Auth**: NextAuth.js v5

### Base de Datos
- **DB**: PostgreSQL 15+
- **Hosting recomendado**: Supabase (gratis) o Railway

### Pagos
- **Principal**: Mercado Pago SDK
- **Secundario**: Transferencia bancaria manual

### Imágenes
- **Storage**: Cloudinary
- **Optimización**: next/image + sharp

### Emails
- **Provider**: Resend o SendGrid
- **Casos de uso**: 
  - Confirmación de pedido
  - Cambio de estado
  - Notificaciones al admin

### Deploy
- **Hosting**: Vercel
- **CDN**: Automático con Vercel
- **DB**: Supabase/Railway (separado)

## 📦 Funcionalidades por Módulo

### 1. Panel de Administración (`/admin`)

#### Dashboard
- [ ] Estadísticas clave (productos, pedidos, ventas)
- [ ] Gráficos de ventas
- [ ] Pedidos recientes
- [ ] Alertas (stock bajo, pedidos pendientes)

#### Productos (`/admin/products`)
- [ ] Listado con búsqueda y filtros
- [ ] Crear producto individual
- [ ] Editar producto
- [ ] Eliminar producto (soft delete)
- [ ] Gestión de variantes (capacidad/tamaño/potencia)
- [ ] Upload de imágenes múltiples
- [ ] Asignar marca y categoría
- [ ] Activar/desactivar productos

#### Pedidos (`/admin/orders`)
- [ ] Listado con filtros por estado
- [ ] Detalle de pedido
- [ ] Cambiar estado
- [ ] Imprimir/exportar orden
- [ ] Ver comprobante de pago
- [ ] Agregar número de tracking
- [ ] Notificar cliente

#### Categorías (`/admin/categories`)
- [ ] CRUD completo
- [ ] Ordenar productos dentro de categoría
- [ ] Imagen de categoría

#### Configuración (`/admin/settings`)
- [ ] Datos del negocio
- [ ] Configuración de envíos (zonas, precios)
- [ ] Métodos de pago
- [ ] Usuarios admin

### 2. E-commerce Público (Tienda)

#### Home (`/`)
- [ ] Banner principal
- [ ] Productos destacados
- [ ] Categorías principales
- [ ] Footer con info

#### Catálogo (`/productos`)
- [ ] Grid responsivo de productos
- [ ] Filtros: categoría, marca, rango de precio
- [ ] Ordenar por: precio, nuevo, nombre
- [ ] Paginación

#### Producto (`/productos/[slug]`)
- [ ] Galería de imágenes
- [ ] Información del producto
- [ ] Selector de variantes (capacidad/tamaño/potencia)
- [ ] Indicador de stock
- [ ] Agregar al carrito
- [ ] Productos relacionados

#### Carrito (`/carrito`)
- [ ] Lista de items con variantes
- [ ] Modificar cantidad
- [ ] Eliminar items
- [ ] Resumen de totales
- [ ] Continuar a checkout

#### Checkout (`/checkout`)
- [ ] Paso 1: Datos del cliente
- [ ] Paso 2: Tipo de envío (retiro/domicilio)
- [ ] Paso 3: Dirección (si corresponde)
- [ ] Paso 4: Método de pago
- [ ] Paso 5: Confirmación
- [ ] Integración Mercado Pago

## 💳 Integración de Pagos

### Mercado Pago
```javascript
// Flujo:
1. Cliente elige productos
2. Inicia checkout
3. Se crea preferencia en MP
4. Cliente completa pago
5. Webhook confirma pago
6. Se actualiza estado del pedido
7. Email de confirmación
```

### Transferencia Bancaria
```javascript
// Flujo:
1. Cliente elige "Transferencia"
2. Se muestra datos bancarios
3. Cliente sube comprobante
4. Pedido queda PENDING
5. Admin valida manualmente
6. Admin cambia a CONFIRMED
7. Email de confirmación
```

## 📨 Sistema de Notificaciones

### Emails al Cliente
- Confirmación de pedido
- Pedido confirmado (pago aprobado)
- Pedido en preparación
- Pedido listo para retiro/enviado
- Pedido entregado

### Emails al Admin
- Nuevo pedido recibido
- Pago pendiente de validación
- Stock bajo en producto

## 🎯 Roadmap de Desarrollo

### ✅ Fase 0: Setup (COMPLETADO)
- [x] Inicializar Next.js
- [x] Configurar Tailwind con colores GrowShop
- [x] Setup Prisma + PostgreSQL
- [x] Configurar NextAuth
- [x] Crear layout admin
- [x] Página de login
- [x] Dashboard básico
- [x] Estructura base de la tienda

### Fase 1: Admin Panel - Productos
**Semana 1-2**
- [ ] CRUD de productos
- [ ] Sistema de variantes (capacidad/tamaño/potencia)
- [ ] Upload de imágenes (Cloudinary)
- [ ] Gestión de stock por variante
- [ ] Preview de producto

**Semana 3**
- [ ] CRUD de categorías
- [ ] Asignar productos a categorías
- [ ] Filtros y búsqueda

### Fase 2: E-commerce Público
**Semana 4-5**
- [ ] Catálogo con filtros
- [ ] Página de producto con variantes
- [ ] Carrito funcional
- [ ] Productos destacados en home

**Semana 6**
- [ ] Checkout flow completo
- [ ] Integración Mercado Pago

### Fase 3: Gestión de Pedidos
**Semana 7-8**
- [ ] Panel de pedidos
- [ ] Sistema de emails
- [ ] Webhooks de MP
- [ ] Tracking

### Fase 4: Deploy
**Semana 9-10**
- [ ] Testing
- [ ] Deploy a Vercel
- [ ] Configurar dominio
- [ ] SEO

## 🔐 Seguridad

- Passwords hasheadas con bcrypt (12 rounds)
- JWT tokens en cookies httpOnly
- Validación con Zod
- HTTPS obligatorio en producción

## 📊 Métricas a Trackear

### Negocio
- Ventas totales
- Productos más vendidos
- Ticket promedio
- Tasa de conversión

### Técnicas
- Performance (Core Web Vitals)
- Errores en producción
- Tiempo de carga

---

**Última actualización**: 13 de Agosto, 2026  
**Contacto**: lucdappiano@gmail.com
