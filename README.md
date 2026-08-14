# 🌿 GrowShop E-commerce

Sistema completo de e-commerce para venta de insumos de cultivo indoor y outdoor. Basado en Next.js 16 con panel de administración integrado.

## 🎯 Características

- ✅ Panel de administración completo
- ✅ Gestión de productos con variantes (capacidad, tamaño, potencia)
- ✅ Sistema de categorías
- ✅ Gestión de pedidos con estados
- ✅ Carrito de compras con localStorage
- ✅ Autenticación con NextAuth
- ✅ Base de datos PostgreSQL con Prisma
- ✅ Integración con Cloudinary para imágenes
- ✅ Pasarela de pago con Mercado Pago
- ✅ Diseño responsive mobile-first

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** - App Router
- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Estilos
- **Lucide React** - Iconos

### Backend
- **Next.js API Routes** - API REST
- **Prisma 7** - ORM
- **PostgreSQL** - Base de datos
- **NextAuth v5** - Autenticación
- **Zod** - Validación de datos

### Servicios
- **Cloudinary** - Almacenamiento de imágenes
- **Mercado Pago** - Procesamiento de pagos
- **Resend/SendGrid** - Emails transaccionales

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repo>
cd growshop
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copiar `.env.example` a `.env` y configurar:

```bash
# Base de datos (usar Supabase o Railway)
DATABASE_URL="postgresql://user:password@host:5432/growshop_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generar-con-openssl-rand-base64-32"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY="TEST-xxxxx"
MP_ACCESS_TOKEN="TEST-xxxxx"

# Email
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="pedidos@growshop.com"

# Admin por defecto
ADMIN_EMAIL="admin@growshop.com"
ADMIN_PASSWORD="cambiar-password"
```

4. **Generar cliente de Prisma**
```bash
npm run db:generate
```

5. **Sincronizar base de datos**
```bash
npm run db:push
```

6. **Poblar con datos iniciales (opcional)**
```bash
npm run db:seed
```

7. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
growshop/
├── app/
│   ├── (store)/          # Tienda pública (group routing)
│   │   ├── page.tsx      # Homepage
│   │   ├── productos/    # Catálogo
│   │   └── carrito/      # Carrito
│   ├── admin/            # Panel de administración
│   │   ├── page.tsx      # Dashboard
│   │   ├── products/     # Gestión de productos
│   │   ├── orders/       # Gestión de pedidos
│   │   └── login/        # Login admin
│   └── api/              # API Routes
│       ├── auth/         # NextAuth
│       └── admin/        # APIs del admin
├── components/
│   ├── admin/            # Componentes del admin
│   └── store/            # Componentes de la tienda
├── lib/
│   ├── auth/             # Configuración de autenticación
│   ├── db/               # Cliente de Prisma
│   └── store/            # Contexto del carrito
├── prisma/
│   ├── schema.prisma     # Schema de la base de datos
│   └── seed.ts           # Datos iniciales
└── types/                # TypeScript types

```

## 🗄️ Modelo de Datos

### Productos
- Información base: nombre, descripción, precio, marca
- Imágenes múltiples
- Variantes por:
  - **Capacidad** (250ml, 1L, 5L) - Fertilizantes/Sustratos
  - **Tamaño** (Pequeño, Mediano, Grande) - Macetas/Carpas
  - **Potencia** (150W, 300W, 600W) - Iluminación
- Control de stock por variante
- Categorización

### Pedidos
- Datos del cliente
- Items del pedido (snapshot)
- Estados: PENDING → CONFIRMED → PREPARING → READY → SHIPPED → DELIVERED
- Métodos de pago: Mercado Pago, Transferencia, Efectivo
- Tipos de envío: Retiro en local, Envío a domicilio

## 🚀 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter

# Prisma
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar schema con DB
npm run db:seed      # Poblar con datos iniciales
npm run db:studio    # Abrir Prisma Studio
```

## 🎨 Paleta de Colores

```css
--grow-green: #4ade80        /* Verde principal */
--grow-green-dark: #22c55e   /* Verde oscuro */
--grow-earth: #92400e        /* Marrón tierra */
--grow-earth-light: #a8a29e  /* Marrón claro */
```

## 📝 Roadmap

### Fase 1: Setup Base ✅
- [x] Configuración de Next.js y Prisma
- [x] Sistema de autenticación
- [x] Modelos de base de datos
- [x] Panel de administración base

### Fase 2: Gestión de Productos
- [ ] CRUD completo de productos
- [ ] Sistema de variantes
- [ ] Upload de imágenes
- [ ] Gestión de categorías

### Fase 3: E-commerce Público
- [ ] Catálogo de productos con filtros
- [ ] Página de producto individual
- [ ] Carrito de compras
- [ ] Checkout flow

### Fase 4: Pagos y Pedidos
- [ ] Integración Mercado Pago
- [ ] Gestión de pedidos
- [ ] Emails transaccionales
- [ ] Sistema de estados

### Fase 5: Deploy y Optimización
- [ ] Deploy a Vercel
- [ ] SEO optimization
- [ ] Performance tuning
- [ ] Analytics

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

## 👥 Contacto

Email: lucdappiano@gmail.com
