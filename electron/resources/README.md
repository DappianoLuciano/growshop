# Íconos de la Aplicación

## Formatos necesarios

- **Windows**: `icon.ico` (256x256 o multi-resolución)
- **macOS**: `icon.icns`
- **Linux**: `icon.png` (512x512)

## Generar íconos

### Opción 1: Herramientas online

1. Ve a https://www.icoconverter.com/
2. Sube el archivo `icon.svg` o crea tu propio diseño
3. Genera los formatos:
   - Para Windows: Descarga como `.ico`
   - Para macOS: Descarga como `.icns`
   - Para Linux: Descarga como `.png` (512x512)

### Opción 2: Con ImageMagick (CLI)

```bash
# Instalar ImageMagick
# Windows: https://imagemagick.org/script/download.php
# macOS: brew install imagemagick
# Linux: sudo apt install imagemagick

# Convertir SVG a PNG
magick icon.svg -resize 512x512 icon.png

# Convertir PNG a ICO (Windows)
magick icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# Para macOS, usar herramientas específicas como png2icns
```

### Opción 3: Photoshop / GIMP / Figma

1. Abre el SVG o crea tu diseño
2. Exporta en las resoluciones necesarias
3. Usa plugins o herramientas para generar .ico y .icns

## Ícono actual

El archivo `icon.svg` contiene un placeholder con:
- Planta en maceta (tema GrowShop)
- Letra "G" 
- Colores verdes (#10b981, #22c55e)

Reemplázalo con tu propio diseño profesional antes de la distribución final.

## Recursos

- [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder) - Generador automático
- [Figma Community](https://www.figma.com/community) - Templates de íconos
- [Icon Kitchen](https://icon.kitchen/) - Generador de íconos para apps
