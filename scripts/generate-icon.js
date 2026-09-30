const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const svgPath = path.join(__dirname, '../electron/resources/icon.svg')
const outputDir = path.join(__dirname, '../electron/resources')

async function generateIcons() {
  try {
    console.log('Generando íconos desde SVG...')

    // Leer el SVG
    const svgBuffer = fs.readFileSync(svgPath)

    // Generar PNG 512x512 (para Linux y base)
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon.png'))

    console.log('✓ icon.png generado (512x512)')

    // Generar PNG 256x256 (para Windows ICO)
    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(outputDir, 'icon-256.png'))

    console.log('✓ icon-256.png generado (256x256)')

    // Generar PNG 128x128
    await sharp(svgBuffer)
      .resize(128, 128)
      .png()
      .toFile(path.join(outputDir, 'icon-128.png'))

    console.log('✓ icon-128.png generado (128x128)')

    console.log('\n✅ Íconos PNG generados exitosamente!')
    console.log('\n⚠️  Nota: Para Windows (.ico) y macOS (.icns), usa herramientas específicas:')
    console.log('   - Windows: https://www.icoconverter.com/')
    console.log('   - macOS: https://cloudconvert.com/png-to-icns')
    console.log('\nO instala electron-icon-builder:')
    console.log('   npm install -g electron-icon-builder')
    console.log('   electron-icon-builder --input=./electron/resources/icon.png --output=./electron/resources')

  } catch (error) {
    console.error('❌ Error generando íconos:', error)
    process.exit(1)
  }
}

generateIcons()
