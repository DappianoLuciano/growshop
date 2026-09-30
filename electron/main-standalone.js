const { app, BrowserWindow, dialog } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const http = require('http')

let mainWindow = null
let nextServer = null
const port = 3000

// Determinar si estamos en desarrollo o producción
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// En producción la app abre el sitio publicado: así el instalador no lleva
// credenciales (.env) ni un servidor propio.
const REMOTE_URL = process.env.AGROGROW_URL || 'https://agrogrowarg.com'

// Rutas para producción
function getResourcePath(relativePath) {
  if (isDev) {
    return path.join(__dirname, '..', relativePath)
  }
  return path.join(process.resourcesPath, relativePath)
}

// Función para verificar si el servidor está listo
function waitForServer(port, maxAttempts = 90) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const hosts = ['127.0.0.1', 'localhost']

    const checkAllHosts = () => {
      attempts++
      if (attempts > maxAttempts) {
        console.error(`❌ Timeout después de ${maxAttempts} intentos`)
        reject(new Error(`El servidor no responde en puerto ${port}`))
        return
      }

      console.log(`[${attempts}/${maxAttempts}] Verificando puerto ${port}...`)

      // Probar todos los hosts en paralelo
      let responded = false
      let errors = []

      hosts.forEach((host) => {
        const url = `http://${host}:${port}`

        http.get(url, (res) => {
          if (!responded) {
            responded = true
            console.log(`✅ Servidor respondió en ${url}!`)
            resolve()
          }
        }).on('error', (err) => {
          errors.push(`${host}: ${err.code}`)

          // Si todos fallaron, intentar de nuevo
          if (errors.length === hosts.length && !responded) {
            setTimeout(checkAllHosts, 1000)
          }
        })
      })
    }

    // Esperar 5 segundos antes de empezar
    console.log('Dando tiempo al servidor para arrancar (5 segundos)...')
    setTimeout(checkAllHosts, 5000)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#0a0a0a',
    title: 'AgroGrow Admin',
    icon: path.join(__dirname, 'resources', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDev
    },
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (isDev) mainWindow.webContents.openDevTools()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    console.log('=== STARTING NEXT.JS SERVER ===')
    console.log('Mode:', isDev ? 'DEVELOPMENT' : 'PRODUCTION')
    console.log('Resources path:', process.resourcesPath)

    if (isDev) {
      // DESARROLLO: usar npm run dev
      console.log('Starting dev server with npm...')

      nextServer = spawn('cmd.exe', ['/c', 'npm', 'run', 'dev'], {
        cwd: path.join(__dirname, '..'),
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      })

      nextServer.stdout.on('data', (data) => {
        const output = data.toString()
        console.log('[Next.js]:', output)
        if (output.includes('Local:') || output.includes('localhost')) {
          console.log('✅ Dev server ready!')
          resolve()
        }
      })

      nextServer.stderr.on('data', (data) => {
        console.error('[Next.js Error]:', data.toString())
      })

      nextServer.on('error', reject)

    } else {
      // PRODUCCIÓN: usar node incluido + next start
      console.log('Starting production server with next start...')

      // Buscar node.exe incluido y next
      const nodePath = path.join(process.resourcesPath, 'node', 'node.exe')
      const appDir = path.join(process.resourcesPath, 'app')
      const nextPath = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next')

      console.log('Node path:', nodePath)
      console.log('App dir:', appDir)
      console.log('Next path:', nextPath)

      // Verificar que existen
      if (!fs.existsSync(nodePath)) {
        const error = `Node.js no encontrado en: ${nodePath}`
        console.error(error)
        reject(new Error(error))
        return
      }

      if (!fs.existsSync(nextPath)) {
        const error = `Next.js no encontrado en: ${nextPath}`
        console.error(error)
        reject(new Error(error))
        return
      }

      // Ejecutar next start con node incluido
      console.log('Ejecutando: node next start -p 3000')
      console.log('CWD:', appDir)

      nextServer = spawn(nodePath, [nextPath, 'start', '-p', port.toString()], {
        cwd: appDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PATH: process.env.PATH
        },
        windowsHide: false
      })

      // Capturar TODOS los logs
      nextServer.stdout.on('data', (data) => {
        const output = data.toString()
        console.log('[STDOUT]:', output)
      })

      nextServer.stderr.on('data', (data) => {
        const error = data.toString()
        console.error('[STDERR]:', error)
      })

      nextServer.on('error', (err) => {
        console.error('[PROCESS ERROR]:', err)
        reject(err)
      })

      let serverExited = false

      nextServer.on('exit', (code, signal) => {
        serverExited = true
        console.error(`[PROCESS EXIT]: code=${code}, signal=${signal}`)
        // NO rechazar aquí - el servidor puede estar corriendo
      })

      // Esperar a que el servidor REALMENTE esté listo
      console.log('Esperando a que el servidor responda...')
      waitForServer(port)
        .then(() => {
          console.log('✅ Servidor está listo!')
          resolve()
        })
        .catch((err) => {
          console.error('❌ Error esperando servidor:', err)
          reject(err)
        })
    }
  })
}

async function initialize() {
  try {
    console.log('\n=== INITIALIZING AGROGROW ADMIN ===')
    console.log('App version:', app.getVersion())
    console.log('Electron version:', process.versions.electron)
    console.log('Is packaged:', app.isPackaged)
    console.log('')

    const window = createWindow()

    let url
    if (isDev) {
      console.log('Starting Next.js server...')
      await startNextServer()
      url = `http://localhost:${port}/admin/dashboard`
    } else {
      url = `${REMOTE_URL}/admin/dashboard`
    }

    console.log(`Loading ${url}...`)

    await window.loadURL(url)
    console.log('✅ App loaded successfully!')

  } catch (error) {
    console.error('\n❌ INITIALIZATION FAILED:', error)

    dialog.showErrorBox(
      'Error al iniciar AgroGrow Admin',
      `No se pudo iniciar la aplicación:\n\n${error.message}\n\nPor favor, contacta a soporte.`
    )

    app.quit()
  }
}

app.whenReady().then(initialize)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (nextServer) {
      console.log('Killing Next.js server...')
      nextServer.kill()
    }
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill()
  }
})
