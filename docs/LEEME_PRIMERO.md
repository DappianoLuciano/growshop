# 🚀 AgroGrow Admin - Aplicación de Escritorio

## ✅ SOLUCIÓN FINAL - SIN ERRORES

### 🎯 Cómo Iniciar la Aplicación

**Opción 1 (MÁS FÁCIL):**
```
Hacer doble clic en: INICIAR_AGROGROW.bat
```

Eso es todo. La app se abrirá automáticamente.

---

## 🔍 Qué Hace el Script

1. Inicia Next.js en segundo plano
2. Espera 25 segundos a que compile
3. Abre la ventana de Electron con tu panel admin
4. Al cerrar, pregunta si querés cerrar Next.js también

---

## ❓ Preguntas Frecuentes

### ¿Por qué tarda 25 segundos?
Next.js necesita compilar tu aplicación la primera vez. Las siguientes veces es más rápido.

### ¿Puedo cerrar la ventana negra?
NO. Esa ventana es el servidor Next.js. Si la cerrás, la aplicación deja de funcionar.

### ¿Funciona sin internet?
SÍ, pero necesitás acceso a la base de datos PostgreSQL (puede ser local o remota).

### ¿Cómo cierro todo?
Cerrá la ventana de Electron y cuando pregunte, elegí "S" para cerrar Next.js también.

---

## 🐛 Si Algo No Funciona

### Error: "Puerto 3000 en uso"
Hay otro Next.js corriendo. Matalo con:
```powershell
Stop-Process -Name "node" -Force
```

### La ventana se abre en blanco
1. Abrí las DevTools (F12)
2. Mirá la consola para ver el error
3. Verificá que `.env` esté configurado

### No encuentra módulos
```powershell
npm install
```

---

## 📂 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `INICIAR_AGROGROW.bat` | **USAR ESTE** - Inicia todo |
| `electron/main.js` | Código de Electron |
| `package.json` | Configuración del proyecto |
| `.env` | Variables de entorno (DB, etc) |

---

## 🎉 ¿Funcionó?

Si la ventana se abrió y ves tu panel admin:

**✅ ÉXITO - La aplicación está funcionando!**

Para crear un instalador .exe para distribuir:
```powershell
npm run electron:build:win
```
(Esto tarda ~10 minutos y crea un instalador en la carpeta `dist/`)

---

## 📞 Soporte

Si seguís teniendo problemas:
1. Verificá que Next.js funcione solo: `npm run dev` y abrí http://localhost:3000
2. Si eso funciona, el problema es solo de Electron
3. Revisá los logs en la consola del .bat

---

**Versión**: 1.0  
**Última actualización**: 2026-09-09  
**Estado**: ✅ Funcionando
