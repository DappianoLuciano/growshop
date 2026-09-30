# GrowShop Admin - Aplicación de Escritorio

Panel de administración de GrowShop como aplicación de escritorio usando Electron + Next.js.

## 🚀 Inicio Rápido

### Desarrollo

```bash
# Instalar dependencias (si aún no lo hiciste)
npm install

# Ejecutar la app en modo desarrollo
npm run electron:dev
```

Esto iniciará Next.js en modo dev y abrirá la ventana de Electron automáticamente.

### Producción

#### Compilar el ejecutable para Windows

```bash
npm run electron:build:win
```

Esto generará:
- **Instalador NSIS**: `dist/GrowShop Admin-0.1.0-x64.exe` (instalador tradicional)
- **Portable**: `dist/GrowShop Admin-0.1.0-x64.exe` (versión portable, no requiere instalación)

Los archivos estarán en la carpeta `dist/`.

#### Otros sistemas operativos

```bash
# macOS
npm run electron:build:mac

# Linux
npm run electron:build:linux

# Todos los sistemas
npm run electron:build
```

## 📋 Requisitos

- Node.js 18 o superior
- NPM 8 o superior
- Acceso a la base de datos PostgreSQL (local o remota)

## ⚙️ Configuración

### Variables de Entorno

La aplicación usa las mismas variables de entorno que la versión web. Asegúrate de tener un archivo `.env` con:

```env
# Base de datos
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (opcional para imágenes)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Base de Datos

Actualmente la app se conecta a la base de datos PostgreSQL remota (la misma que usa la versión web).

**Opciones futuras:**
- Usar SQLite local para cada instalación
- Sincronización con servidor remoto

## 🏗️ Estructura del Proyecto

```
growshop/
├── electron/
│   ├── main.js              # Proceso principal de Electron
│   └── resources/           # Íconos y recursos
├── app/                     # Aplicación Next.js (sin cambios)
├── components/              # Componentes React (sin cambios)
├── electron-builder.json    # Configuración de empaquetado
└── package.json             # Scripts actualizados
```

## 🔧 Desarrollo

### Depuración

En modo desarrollo (`npm run electron:dev`), las DevTools se abren automáticamente.

### Hot Reload

Next.js recarga automáticamente los cambios. Para ver los cambios, simplemente:
1. Guarda el archivo
2. Next.js recompilará
3. Recarga la ventana (Ctrl+R o Cmd+R)

## 📦 Distribución

### Instalador vs Portable

- **Instalador (NSIS)**: Se instala en `C:\Program Files\`, crea accesos directos, aparece en "Agregar o quitar programas"
- **Portable**: Un solo ejecutable que puede ejecutarse desde cualquier lugar sin instalación

### Firmar la aplicación (Opcional)

Para distribución profesional, deberías firmar el ejecutable con un certificado de código:

```json
// En electron-builder.json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
}
```

## 🎨 Personalización

### Ícono de la aplicación

Coloca tus íconos en `electron/resources/`:
- Windows: `icon.ico` (256x256)
- macOS: `icon.icns`
- Linux: `icon.png` (512x512)

### Ventana

Edita `electron/main.js` para cambiar:
- Tamaño de ventana
- Página inicial
- Opciones de seguridad

## 🐛 Troubleshooting

### La app no inicia

1. Verifica que Next.js compile correctamente:
   ```bash
   npm run build
   ```

2. Revisa la consola de Electron (se abre automáticamente en dev)

### Error de base de datos

1. Verifica que `.env` tenga `DATABASE_URL` correcta
2. Asegúrate de tener acceso a la base de datos
3. Ejecuta las migraciones si es necesario:
   ```bash
   npm run db:push
   ```

### Build falla

1. Limpia node_modules y reinstala:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Limpia el build de Next.js:
   ```bash
   rm -rf .next
   npm run build
   ```

## 📝 Próximos Pasos

- [ ] Agregar auto-actualización
- [ ] Implementar SQLite local (opcional)
- [ ] Notificaciones nativas
- [ ] Integración con impresoras (para órdenes)
- [ ] Modo offline básico
- [ ] Firmar certificado para distribución

## 🤝 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**Versión**: 0.1.0  
**Electron**: 44.x  
**Next.js**: 16.x
