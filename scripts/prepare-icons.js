const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const logoPath = path.join(__dirname, '../public/images/logo.jpg')
const outputDir = path.join(__dirname, '../electron/resources')

async function prepareIcons() {
  try {
    console.log('🎨 Preparando íconos de AgroGrow...\n')

    // Verificar que existe el logo
    if (!fs.existsSync(logoPath)) {
      throw new Error('No se encontró el logo en public/images/logo.jpg')
    }

    // Leer el logo original
    const logoBuffer = fs.readFileSync(logoPath)

    // Generar PNG 1024x1024 (alta calidad base)
    await sharp(logoBuffer)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon-1024.png'))
    console.log('✓ icon-1024.png generado (1024x1024)')

    // Generar PNG 512x512 (para Linux)
    await sharp(logoBuffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon.png'))
    console.log('✓ icon.png generado (512x512)')

    // Generar PNG 256x256 (para Windows)
    await sharp(logoBuffer)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon-256.png'))
    console.log('✓ icon-256.png generado (256x256)')

    // Generar PNG 128x128
    await sharp(logoBuffer)
      .resize(128, 128, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon-128.png'))
    console.log('✓ icon-128.png generado (128x128)')

    // Generar PNG 64x64
    await sharp(logoBuffer)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon-64.png'))
    console.log('✓ icon-64.png generado (64x64)')

    // Generar PNG 32x32
    await sharp(logoBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon-32.png'))
    console.log('✓ icon-32.png generado (32x32)')

    // Generar PNG 16x16
    await sharp(logoBuffer)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon-16.png'))
    console.log('✓ icon-16.png generado (16x16)')

    console.log('\n✅ Todos los íconos generados exitosamente!')
    console.log('\n📦 Ahora generando archivo .ico para Windows...\n')

    // Generar archivo ICO usando electron-icon-maker si está disponible
    // Por ahora, electron-builder puede usar el PNG directamente
    console.log('ℹ️  Electron Builder usará icon-256.png para generar el .ico automáticamente\n')

  } catch (error) {
    console.error('❌ Error preparando íconos:', error)
    process.exit(1)
  }
}

prepareIcons()
