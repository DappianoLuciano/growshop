const pngToIco = require('png-to-ico')
const fs = require('fs')
const path = require('path')

async function generateIco() {
  try {
    console.log('🎨 Generando archivo .ico para Windows...\n')

    const inputPng = path.join(__dirname, '../electron/resources/icon-256.png')
    const outputIco = path.join(__dirname, '../electron/resources/icon.ico')

    if (!fs.existsSync(inputPng)) {
      throw new Error(`No se encontró ${inputPng}`)
    }

    // png-to-ico puede tener diferentes sintaxis según la versión
    let buf
    if (typeof pngToIco === 'function') {
      buf = await pngToIco(inputPng)
    } else if (pngToIco.default) {
      buf = await pngToIco.default(inputPng)
    } else {
      throw new Error('No se pudo determinar cómo usar png-to-ico')
    }

    fs.writeFileSync(outputIco, buf)

    console.log('✅ icon.ico generado exitosamente!')
    console.log(`📁 Ubicación: ${outputIco}\n`)

  } catch (error) {
    console.error('❌ Error generando .ico:', error)
    process.exit(1)
  }
}

generateIco()
