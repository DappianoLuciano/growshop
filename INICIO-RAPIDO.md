# ⚡ Inicio Rápido - GrowShop E-commerce

## 🎯 Resumen del Proyecto

Proyecto completo de e-commerce para venta de insumos de cultivo, **replicado desde kaia-ecommerce** y adaptado para:
- Productos con variantes por **capacidad** (fertilizantes), **tamaño** (macetas) y **potencia** (iluminación)
- Categorías específicas de grow-shop (fertilizantes, sustratos, iluminación, etc.)
- Gestión completa de inventario y pedidos
- Panel de administración profesional
- Tienda pública con carrito

## 📁 Estructura Creada

```
growshop/
├── 📄 Configuración
│   ├── package.json          ✅ Dependencias completas
│   ├── tsconfig.json         ✅ TypeScript configurado
│   ├── next.config.ts        ✅ Next.js 16
│   ├── tailwind (via @theme) ✅ Tailwind CSS 4
│   ├── .env.example          ✅ Variables de entorno
│   └── .gitignore            ✅ Configurado
│
├── 🗄️ Base de Datos
│   └── prisma/
│       ├── schema.prisma     ✅ Modelo adaptado para growshop
│       └── seed.ts           ✅ Datos iniciales
│
├── 🔐 Autenticación
│   └── lib/auth/
│       ├── auth.ts           ✅ NextAuth v5 configurado
│       ├── auth.config.ts    ✅ Providers
│       └── require-auth.ts   ✅ Middleware de protección
│
├── 🎨 Frontend
│   ├── app/
│   │   ├── layout.tsx        ✅ Layout principal con CartProvider
│   │   ├── globals.css       ✅ Estilos con colores grow-shop
│   │   ├── (store)/          ✅ Tienda pública (group routing)
│   │   │   ├── page.tsx      ✅ Homepage
│   │   │   └── layout.tsx    ✅ Header + Footer
│   │   └── admin/            ✅ Panel de administración
│   │       ├── page.tsx      ✅ Dashboard con stats
│   │       └── login/        ✅ Login page
│   │
│   └── components/
│       ├── admin/
│       │   └── AdminNav.tsx  ✅ Navegación del admin
│       └── store/
│           ├── Header.tsx    ✅ Header con carrito
│           └── Footer.tsx    ✅ Footer
│
├── 🛒 Carrito
│   └── lib/store/
│       └── cart-context.tsx  ✅ Context con localStorage
│
├── 🔧 Utilidades
│   └── lib/db/
│       └── prisma.ts         ✅ Cliente Prisma configurado
│
└── 📚 Documentación
    ├── README.md             ✅ Documentación completa
    ├── PROYECTO.md           ✅ Especificaciones del proyecto
    └── SETUP.md              ✅ Guía de instalación paso a paso
```

## 🚀 Para Empezar AHORA

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar .env
```bash
# Copiar ejemplo
cp .env.example .env

# Editar .env con tus credenciales:
# - DATABASE_URL (Supabase o PostgreSQL local)
# - NEXTAUTH_SECRET (generar con: openssl rand -base64 32)
# - Cloudinary credentials
# - Admin email/password
```

### 3. Inicializar base de datos
```bash
npm run db:generate   # Generar cliente Prisma
npm run db:push       # Crear tablas
npm run db:seed       # Poblar con datos ejemplo
```

### 4. Ejecutar proyecto
```bash
npm run dev
```

Abrir: [http://localhost:3000](http://localhost:3000)

### 5. Acceder al Admin
- URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Email: `admin@growshop.com` (o el que configuraste)
- Password: el que configuraste en `.env`

## ✅ Checklist de Verificación

- [ ] ¿Se instalaron las dependencias sin errores?
- [ ] ¿Configuraste todas las variables en `.env`?
- [ ] ¿Se generó el cliente de Prisma correctamente?
- [ ] ¿Se crearon las tablas en la base de datos?
- [ ] ¿Se ejecutó el seed exitosamente?
- [ ] ¿Carga la página principal?
- [ ] ¿Puedes hacer login en el admin?
- [ ] ¿Ves el dashboard con estadísticas?

## 🎨 Paleta de Colores (Customizable)

Editar en `app/globals.css`:

```css
--grow-green: #4ade80        /* Verde principal */
--grow-green-dark: #22c55e   /* Verde oscuro */
--grow-earth: #92400e        /* Marrón tierra */
--grow-earth-light: #a8a29e  /* Marrón claro */
```

## 📝 Diferencias vs kaia-ecommerce

### Variantes Adaptadas
**Antes (kaia):**
- `size`: XS, S, M, L, XL
- `color`: Colores de ropa
- Medidas específicas (busto, cadera, etc.)

**Ahora (growshop):**
- `capacity`: 250ml, 1L, 5L (fertilizantes/líquidos)
- `size`: Pequeño, Mediano, Grande (macetas/carpas)
- `power`: 150W, 300W, 600W (iluminación)
- `specs`: JSON para specs adicionales

### Categorías Adaptadas
**Antes:** Ropa (Vestidos, Pantalones, etc.)  
**Ahora:** Insumos (Fertilizantes, Sustratos, Iluminación, etc.)

### Colores Adaptados
**Antes:** Rosa pastel + Aqua (ropa femenina)  
**Ahora:** Verde + Tierra (naturaleza/cultivo)

## 📋 Próximos Pasos

1. **Configurar Supabase/Railway** (si aún no lo hiciste)
2. **Subir a GitHub** y hacer primer commit
3. **Crear primeros productos** desde el admin
4. **Personalizar textos** (descripción del negocio, contacto, etc.)
5. **Configurar Mercado Pago** cuando tengas credenciales
6. **Deploy a Vercel** cuando esté listo

## 🔗 Links Útiles

- 📖 Documentación completa: `README.md`
- 🛠️ Guía de setup detallada: `SETUP.md`
- 📋 Especificaciones del proyecto: `PROYECTO.md`
- 🐛 Troubleshooting en `SETUP.md`

## 🆘 Necesitas Ayuda?

1. Revisa `SETUP.md` sección de Troubleshooting
2. Verifica logs en la terminal
3. Abre Prisma Studio: `npm run db:studio`
4. Contacto: lucdappiano@gmail.com

---

🎉 **¡Todo listo para empezar a construir tu GrowShop!**
