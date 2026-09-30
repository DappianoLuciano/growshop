const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let mainWindow = null
let nextServer = null

// Usar NODE_ENV o verificar si hay carpeta .next/standalone
const isDev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#0a0a0a',
    title: 'AgroGrow Admin',
    icon: path.join(__dirname, 'resources/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true // Siempre habilitar devtools para debug
    },
    show: false,
    frame: true,
    titleBarStyle: 'default'
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    console.log('=== STARTING NEXT.JS ===')
    console.log('isDev:', isDev)
    console.log('__dirname:', __dirname)
    console.log('process.cwd():', process.cwd())

    const projectRoot = path.join(__dirname, '..')
    console.log('Project root:', projectRoot)

    if (isDev) {
      // DESARROLLO: usar next dev
      console.log('Starting in DEV mode with: npm run dev')

      nextServer = spawn('npm', ['run', 'dev'], {
        shell: true,
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      let output = ''
      nextServer.stdout.on('data', (data) => {
        output = data.toString()
        console.log('[Next.js]:', output)

        if (output.includes('Local:') || output.includes('localhost:3000')) {
          console.log('✅ Next.js ready!')
          resolve()
        }
      })

      nextServer.stderr.on('data', (data) => {
        console.error('[Next.js Error]:', data.toString())
      })

      nextServer.on('error', (err) => {
        console.error('[Next.js Process Error]:', err)
        reject(err)
      })

      nextServer.on('exit', (code) => {
        console.log('[Next.js] Process exited with code:', code)
        if (code !== 0 && code !== null) {
          reject(new Error(`Next.js exited with code ${code}`))
        }
      })

    } else {
      // PRODUCCIÓN: usar next start (requiere npm run build previo)
      console.log('Starting in PRODUCTION mode with: npm run start')

      nextServer = spawn('npm', ['run', 'start'], {
        shell: true,
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PORT: port.toString(),
          NODE_ENV: 'production'
        }
      })

      nextServer.stdout.on('data', (data) => {
        console.log('[Next.js]:', data.toString())
      })

      nextServer.stderr.on('data', (data) => {
        console.error('[Next.js Error]:', data.toString())
      })

      nextServer.on('error', (err) => {
        console.error('[Next.js Process Error]:', err)
        reject(err)
      })

      // En producción, esperar 5 segundos para que inicie
      setTimeout(() => {
        console.log('✅ Next.js should be ready')
        resolve()
      }, 5000)
    }
  })
}

async function initialize() {
  try {
    console.log('\n=== INITIALIZING AGROGROW ADMIN ===\n')

    // Crear ventana
    const window = createWindow()

    // Iniciar servidor Next.js
    console.log('Starting Next.js server...')
    await startNextServer()

    // Cargar la app
    const url = `http://localhost:${port}/admin/dashboard`
    console.log(`\nLoading ${url}...\n`)

    try {
      await window.loadURL(url)
      console.log('✅ App loaded successfully!')
    } catch (loadError) {
      console.error('❌ Failed to load URL:', loadError)
      throw loadError
    }

  } catch (error) {
    console.error('\n❌ INITIALIZATION FAILED:', error)
    console.error('Error details:', error.stack)

    // Mostrar diálogo de error
    const { dialog } = require('electron')
    dialog.showErrorBox(
      'Error al iniciar AgroGrow Admin',
      `No se pudo iniciar la aplicación:\n\n${error.message}\n\nRevisa la consola para más detalles.`
    )

    app.quit()
  }
}

// Evento cuando Electron está listo
app.whenReady().then(initialize)

// Salir cuando todas las ventanas estén cerradas
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

// Limpiar al salir
app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill()
  }
})

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
