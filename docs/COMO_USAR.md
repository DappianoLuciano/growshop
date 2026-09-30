# 🚀 Cómo Usar AgroGrow Admin - Aplicación de Escritorio

## ✅ Forma Más Simple (RECOMENDADA)

### Opción 1: Doble clic

1. **Hacer doble clic en**: `LANZAR_APP.bat`
2. Esperar ~20 segundos
3. Se abrirá la ventana de Electron con tu panel admin

**Nota**: Esto dejará una ventana de terminal abierta con Next.js corriendo. NO la cierres mientras uses la app.

---

## 🔧 Forma Manual (Si la anterior no funciona)

### Paso 1: Iniciar Next.js

Abrir PowerShell en la carpeta del proyecto y ejecutar:
```powershell
npm run dev
```

Esperar a que diga "✓ Ready in X.Xs"

### Paso 2: En OTRA terminal, iniciar Electron

```powershell
npx electron electron/launch.js
```

---

## 📦 Para Crear un Instalador (Futuro)

Cuando todo funcione bien en desarrollo, ejecutar:

```powershell
npm run electron:build:win
```

Esto creará un instalador en la carpeta `dist/`

---

## ❌ Problemas Comunes

### "No abre la ventana"
- Verificá que Next.js esté corriendo en http://localhost:3000
- Abrí un navegador y probá ir a http://localhost:3000/admin/dashboard
- Si funciona en el navegador, el problema es de Electron

### "Error de puerto 3000 en uso"
- Cerrá cualquier otra instancia de Next.js que esté corriendo
- En PowerShell: `Stop-Process -Name "node" -Force`

### "Pantalla en blanco"
- Abrí las DevTools (F12 o Ctrl+Shift+I en la ventana de Electron)
- Mirá la consola para ver errores

---

## 📝 Archivos Importantes

- `LANZAR_APP.bat` - Lanzador simple (doble clic)
- `electron/launch.js` - Código simple de Electron (auto-generado)
- `electron/main.js` - Código completo con todas las features
- `package.json` - Scripts npm disponibles

---

## 🎯 Próximos Pasos

Una vez que funcione con el lanzador manual:

1. ✅ Arreglar `electron/main.js` para que funcione con `npm run electron:dev`
2. ✅ Configurar el build de producción correctamente
3. ✅ Crear instalador con logo de AgroGrow
4. ✅ Probar en otra PC

---

**¿Dudas?** Revisá los logs en la consola o probá las opciones manuales.
