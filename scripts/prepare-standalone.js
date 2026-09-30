const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const NODE_VERSION = '20.18.1' // Versión LTS de Node.js
const ARCH = 'x64'
const NODE_URL = `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-${ARCH}.zip`

const resourcesDir = path.join(__dirname, '..', 'resources-standalone')
const nodeDir = path.join(resourcesDir, 'node')
const appDir = path.join(resourcesDir, 'app')

console.log('=== PREPARANDO INSTALADOR COMPLETO ===\n')

// Paso 1: Crear directorios
console.log('1. Creando directorios...')
if (!fs.existsSync(resourcesDir)) fs.mkdirSync(resourcesDir, { recursive: true })
if (!fs.existsSync(nodeDir)) fs.mkdirSync(nodeDir, { recursive: true })
if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true })
console.log('   ✓ Directorios creados\n')

// Paso 2: Descargar Node.js portable
console.log('2. Verificando Node.js portable...')
const nodeExePath = path.join(nodeDir, 'node.exe')

if (fs.existsSync(nodeExePath)) {
  console.log('   ✓ Node.js ya está descargado\n')
} else {
  console.log('   Descargando Node.js portable...')
  console.log(`   URL: ${NODE_URL}`)
  console.log('   Esto puede tardar unos minutos...\n')

  const downloadScript = `
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri "${NODE_URL}" -OutFile "${resourcesDir}\\node.zip"
    Expand-Archive -Path "${resourcesDir}\\node.zip" -DestinationPath "${resourcesDir}\\node-temp" -Force
    Copy-Item "${resourcesDir}\\node-temp\\node-v${NODE_VERSION}-win-${ARCH}\\*" "${nodeDir}" -Recurse -Force
    Remove-Item "${resourcesDir}\\node.zip" -Force
    Remove-Item "${resourcesDir}\\node-temp" -Recurse -Force
  `

  try {
    execSync(`powershell -Command "${downloadScript}"`, { stdio: 'inherit' })
    console.log('   ✓ Node.js descargado\n')
  } catch (error) {
    console.error('   ✗ Error descargando Node.js:', error.message)
    console.log('\n   Intentando método alternativo...\n')

    const systemNode = process.execPath
    fs.copyFileSync(systemNode, nodeExePath)
    console.log('   ✓ Node.js copiado del sistema\n')
  }
}

// Paso 3: Build de Next.js
console.log('3. Compilando Next.js...')
try {
  execSync('npm run build', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  })
  console.log('   ✓ Next.js compilado\n')
} catch {
  console.error('   ✗ Error compilando Next.js')
  process.exit(1)
}

// Paso 4: Copiar TODO el proyecto
console.log('4. Copiando proyecto completo...')
const projectRoot = path.join(__dirname, '..')

// Archivos y carpetas a copiar
const itemsToCopy = [
  '.next',
  'node_modules',
  'public',
  'package.json',
  'package-lock.json'
  // Los .env NO se copian: el instalador no debe llevar credenciales.
  // La app empaquetada abre el sitio publicado (ver electron/main-standalone.js).
]

console.log('   Copiando archivos necesarios...')

for (const item of itemsToCopy) {
  const srcPath = path.join(projectRoot, item)
  const destPath = path.join(appDir, item)

  if (fs.existsSync(srcPath)) {
    const stat = fs.statSync(srcPath)

    if (stat.isDirectory()) {
      console.log(`   - Copiando directorio: ${item}`)
      try {
        execSync(`robocopy "${srcPath}" "${destPath}" /E /NFL /NDL /NJH /NJS /nc /ns /np`, {
          stdio: 'pipe'
        })
      } catch (error) {
        if (error.status >= 8) {
          console.error(`   ✗ Error copiando ${item}`)
          throw error
        }
      }
    } else {
      console.log(`   - Copiando archivo: ${item}`)
      fs.copyFileSync(srcPath, destPath)
    }
  } else {
    console.log(`   - Omitiendo (no existe): ${item}`)
  }
}

console.log('   ✓ Proyecto copiado\n')

console.log('=== ✅ PREPARACIÓN COMPLETADA ===\n')
console.log('Estructura creada:')
console.log('  resources-standalone/')
console.log('  ├── node/')
console.log('  │   └── node.exe')
console.log('  └── app/')
console.log('      ├── .next/')
console.log('      ├── node_modules/')
console.log('      ├── public/')
console.log('      └── package.json')
console.log('')
console.log('Ahora ejecutá: npm run build:installer')
