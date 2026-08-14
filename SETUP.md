# 🚀 Guía de Setup - GrowShop

## Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 15+ (o cuenta en Supabase/Railway)
- Cuenta de Cloudinary (gratis)
- Git

## Paso 1: Instalar Dependencias

```bash
npm install
```

## Paso 2: Configurar Base de Datos

### Opción A: Supabase (Recomendado - Gratis)

1. Ir a [supabase.com](https://supabase.com)
2. Crear una cuenta y nuevo proyecto
3. Ir a Settings → Database
4. Copiar la "Connection string" (modo "Transaction")
5. Pegar en `.env` como `DATABASE_URL`

### Opción B: PostgreSQL Local

```bash
# Instalar PostgreSQL
# Crear base de datos
createdb growshop_db

# En .env:
DATABASE_URL="postgresql://usuario:password@localhost:5432/growshop_db"
```

## Paso 3: Variables de Entorno

Copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```bash
# Database - Usar tu connection string de Supabase o PostgreSQL local
DATABASE_URL="postgresql://..."

# NextAuth - Generar secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-generado"  # openssl rand -base64 32

# Cloudinary - Obtener en cloudinary.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# Admin por defecto
ADMIN_EMAIL="admin@growshop.com"
ADMIN_PASSWORD="tu-password-seguro"
```

### Generar NEXTAUTH_SECRET

```bash
# En terminal:
openssl rand -base64 32
```

### Obtener Credenciales de Cloudinary

1. Ir a [cloudinary.com](https://cloudinary.com)
2. Crear cuenta gratuita
3. En Dashboard, copiar:
   - Cloud Name
   - API Key
   - API Secret

## Paso 4: Inicializar Base de Datos

```bash
# Generar el cliente de Prisma
npm run db:generate

# Sincronizar el schema con la base de datos
npm run db:push

# Poblar con datos iniciales (usuario admin + categorías + productos ejemplo)
npm run db:seed
```

## Paso 5: Ejecutar Proyecto

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🔑 Acceder al Admin

1. Ir a [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Usar las credenciales del `.env`:
   - Email: `admin@growshop.com` (o el que configuraste)
   - Password: el que configuraste en `ADMIN_PASSWORD`

## ✅ Verificar Instalación

- [ ] La página principal carga correctamente
- [ ] Puedes hacer login en `/admin/login`
- [ ] El dashboard muestra estadísticas (debería mostrar 0 o datos del seed)
- [ ] Prisma Studio abre correctamente: `npm run db:studio`

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo

# Base de datos
npm run db:generate      # Regenerar cliente Prisma tras cambios en schema
npm run db:push          # Aplicar cambios del schema a la DB
npm run db:seed          # Ejecutar seed de nuevo
npm run db:studio        # Abrir Prisma Studio (GUI para ver DB)

# Producción
npm run build            # Build para producción
npm run start            # Servidor de producción
```

## 🐛 Troubleshooting

### Error: "Invalid DATABASE_URL"
- Verificar que la URL de conexión esté correcta
- Si es Supabase, asegurarse de usar la "Transaction" connection string

### Error: "NEXTAUTH_SECRET is not defined"
- Generar un secret con `openssl rand -base64 32`
- Agregarlo al `.env`

### Error al hacer seed
- Verificar que `npm run db:push` se haya ejecutado antes
- Verificar que el usuario admin no exista ya en la DB

### No aparecen imágenes
- Verificar credenciales de Cloudinary en `.env`
- Verificar que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` tenga el prefijo `NEXT_PUBLIC_`

## 📚 Próximos Pasos

1. **Crear Productos**: Ir a Admin → Productos → Nuevo Producto
2. **Personalizar Colores**: Editar `app/globals.css`
3. **Configurar Mercado Pago**: Obtener credenciales y agregar al `.env`
4. **Deploy**: Ver `README.md` sección de deploy

## 🆘 Ayuda

Si encuentras problemas:
- Revisar logs de la terminal
- Abrir Prisma Studio: `npm run db:studio`
- Verificar el archivo `.env`
- Contacto: lucdappiano@gmail.com
