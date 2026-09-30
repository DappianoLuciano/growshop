# 📊 Configuración de Google Sheets con Supabase

Esta guía te muestra cómo conectar un Google Sheet a tu base de datos de Supabase para ver productos, precios y stock en tiempo real.

## 🎯 Resultado Final

Tu Google Sheet mostrará:
- ✅ Nombre del producto
- ✅ Marca
- ✅ Categoría
- ✅ Precio
- ✅ Precio en oferta (si aplica)
- ✅ SKU de cada variante
- ✅ Descripción de variante (tamaño, capacidad, potencia)
- ✅ Stock por variante
- ✅ Stock total del producto
- ✅ Última actualización automática

---

## 📝 Paso 1: Configurar el Endpoint API

Ya está configurado en tu proyecto. El endpoint es:

```
https://TU-DOMINIO.vercel.app/api/sheets/productos?key=growshop-secret-key-2024
```

> ⚠️ **Importante**: Reemplaza `TU-DOMINIO` con tu URL real de Vercel cuando hagas el deploy.

Para desarrollo local, usa:
```
http://localhost:3000/api/sheets/productos?key=growshop-secret-key-2024
```

---

## 📊 Paso 2: Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala como quieras (ej: "Stock GrowShop")

---

## 🔧 Paso 3: Configurar Google Apps Script

1. En tu Google Sheet, ve a **Extensiones** → **Apps Script**
2. Borra todo el código que aparece por defecto
3. Copia y pega el siguiente código:

\`\`\`javascript
// ============= CONFIGURACIÓN =============
const API_URL = 'https://TU-DOMINIO.vercel.app/api/sheets/productos?key=growshop-secret-key-2024';
const SHEET_NAME = 'Productos'; // Nombre de la pestaña

// ============= FUNCIÓN PRINCIPAL =============
function actualizarProductos() {
  try {
    // Hacer petición al API
    const response = UrlFetchApp.fetch(API_URL, {
      method: 'GET',
      muteHttpExceptions: true
    });
    
    const statusCode = response.getResponseCode();
    if (statusCode !== 200) {
      throw new Error(\`Error en la petición: \${statusCode}\`);
    }
    
    const jsonData = JSON.parse(response.getContentText());
    
    if (!jsonData.success) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    const productos = jsonData.data;
    
    // Obtener o crear la hoja
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    
    // Limpiar contenido anterior (mantener formato)
    if (sheet.getLastRow() > 0) {
      sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();
    }
    
    // Encabezados
    const headers = [
      'Producto',
      'Marca',
      'Categoría',
      'Precio',
      'En Oferta',
      'Precio Oferta',
      'SKU',
      'Variante',
      'Stock',
      'Stock Total',
      'Última Actualización'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formatear encabezados
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4CAF50')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    // Insertar datos
    if (productos.length > 0) {
      const rows = productos.map(p => [
        p.producto,
        p.marca,
        p.categoria,
        p.precio,
        p.enOferta,
        p.precioOferta || '',
        p.sku,
        p.variante,
        p.stock,
        p.stockTotal,
        new Date(p.ultimaActualizacion).toLocaleString('es-AR')
      ]);
      
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      
      // Formatear columnas de precio
      sheet.getRange(2, 4, rows.length, 1).setNumberFormat('$#,##0.00');
      sheet.getRange(2, 6, rows.length, 1).setNumberFormat('$#,##0.00');
      
      // Formatear columnas de stock
      sheet.getRange(2, 9, rows.length, 2).setHorizontalAlignment('center');
      
      // Aplicar formato condicional al stock
      const stockRange = sheet.getRange(2, 9, rows.length, 1);
      const rules = sheet.getConditionalFormatRules();
      
      // Stock = 0 (Rojo)
      const rule1 = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberEqualTo(0)
        .setBackground('#FFCDD2')
        .setRanges([stockRange])
        .build();
      
      // Stock 1-5 (Amarillo)
      const rule2 = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberBetween(1, 5)
        .setBackground('#FFF9C4')
        .setRanges([stockRange])
        .build();
      
      // Stock > 5 (Verde)
      const rule3 = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThan(5)
        .setBackground('#C8E6C9')
        .setRanges([stockRange])
        .build();
      
      rules.push(rule1, rule2, rule3);
      sheet.setConditionalFormatRules(rules);
    }
    
    // Ajustar ancho de columnas
    sheet.autoResizeColumns(1, headers.length);
    
    // Congelar la primera fila
    sheet.setFrozenRows(1);
    
    // Agregar información de actualización
    const infoCell = sheet.getRange(1, headers.length + 2);
    infoCell.setValue(\`✅ Actualizado: \${new Date().toLocaleString('es-AR')}\`);
    infoCell.setFontSize(10);
    infoCell.setFontColor('#666666');
    
    SpreadsheetApp.getUi().alert(\`✅ Productos actualizados correctamente\\n\\nTotal: \${productos.length} productos\`);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(\`❌ Error al actualizar productos:\\n\${error.toString()}\`);
    Logger.log('Error: ' + error.toString());
  }
}

// ============= FUNCIÓN DE ACTUALIZACIÓN AUTOMÁTICA =============
function configurarActualizacionAutomatica() {
  // Eliminar triggers anteriores
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'actualizarProductos') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Crear nuevo trigger (cada 30 minutos)
  ScriptApp.newTrigger('actualizarProductos')
    .timeBased()
    .everyMinutes(30)
    .create();
  
  SpreadsheetApp.getUi().alert('✅ Actualización automática configurada\\n\\nSe actualizará cada 30 minutos');
}

// ============= MENÚ PERSONALIZADO =============
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🌱 GrowShop')
    .addItem('🔄 Actualizar Ahora', 'actualizarProductos')
    .addItem('⚙️ Configurar Auto-Actualización', 'configurarActualizacionAutomatica')
    .addToUi();
}
\`\`\`

4. **IMPORTANTE**: Reemplaza `TU-DOMINIO.vercel.app` con tu URL real de Vercel
5. Guarda el proyecto (Ctrl+S o Cmd+S)
6. Dale un nombre al proyecto (ej: "GrowShop Sync")

---

## 🚀 Paso 4: Ejecutar por Primera Vez

1. En el editor de Apps Script, selecciona la función `actualizarProductos` del menú desplegable
2. Haz clic en **Ejecutar** (▶️)
3. Google te pedirá permisos:
   - Haz clic en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Haz clic en "Avanzado"
   - Haz clic en "Ir a [nombre del proyecto] (no seguro)"
   - Haz clic en "Permitir"
4. Vuelve a tu Google Sheet y verás los datos

---

## ⚙️ Paso 5: Configurar Actualización Automática

1. En tu Google Sheet, verás un nuevo menú **🌱 GrowShop**
2. Haz clic en **⚙️ Configurar Auto-Actualización**
3. Autoriza los permisos si te los pide
4. ¡Listo! Ahora se actualizará automáticamente cada 30 minutos

> 💡 **Tip**: Puedes cambiar la frecuencia editando el número en `.everyMinutes(30)` (mínimo 1 minuto, máximo 1440 para diario)

---

## 🎨 Características del Sheet

### Colores de Stock Automáticos:
- 🔴 **Rojo**: Stock = 0 (Sin stock)
- 🟡 **Amarillo**: Stock 1-5 (Stock bajo)
- 🟢 **Verde**: Stock > 5 (Stock normal)

### Columnas:
- **Producto**: Nombre del producto
- **Marca**: Marca del producto
- **Categoría**: Categoría asignada
- **Precio**: Precio regular (formato moneda)
- **En Oferta**: "Sí" o "No"
- **Precio Oferta**: Precio rebajado (si aplica)
- **SKU**: Código único de la variante
- **Variante**: Descripción (tamaño/capacidad/potencia)
- **Stock**: Stock de esta variante específica
- **Stock Total**: Stock total del producto (todas las variantes)
- **Última Actualización**: Timestamp de la última sync

---

## 🔧 Personalización

### Cambiar la frecuencia de actualización:

Edita esta línea en el código:
\`\`\`javascript
.everyMinutes(30)  // Cambiar 30 por los minutos que quieras
\`\`\`

Opciones:
- `.everyMinutes(15)` - Cada 15 minutos
- `.everyHours(1)` - Cada 1 hora
- `.everyDays(1).atHour(9)` - Diariamente a las 9 AM

### Cambiar el nombre de la pestaña:

Edita esta línea:
\`\`\`javascript
const SHEET_NAME = 'Productos';  // Cambiar por el nombre que quieras
\`\`\`

### Agregar filtros de datos:

Puedes agregar esta función para activar filtros:
\`\`\`javascript
sheet.getRange(1, 1, sheet.getLastRow(), headers.length).createFilter();
\`\`\`

---

## 🔒 Seguridad

- La clave API (`SHEETS_API_KEY`) protege el endpoint
- Solo responde a peticiones con la clave correcta
- Solo devuelve productos activos
- Es un endpoint de **solo lectura** (no puede modificar datos)

### Para cambiar la clave de seguridad:

1. En tu archivo `.env`, modifica:
   \`\`\`
   SHEETS_API_KEY="tu-nueva-clave-super-secreta"
   \`\`\`

2. En el script de Google Apps Script, actualiza:
   \`\`\`javascript
   const API_URL = 'https://TU-DOMINIO.vercel.app/api/sheets/productos?key=tu-nueva-clave-super-secreta';
   \`\`\`

---

## 🐛 Solución de Problemas

### "Error 401 - Clave de API inválida"
- Verifica que la clave en el script coincida con la de `.env`
- Asegúrate de haber hecho el deploy a Vercel después de agregar `SHEETS_API_KEY`

### "Error 500 - Error del servidor"
- Verifica que la base de datos esté corriendo
- Revisa los logs de Vercel para más detalles

### "No se actualizan los datos"
- Ve a **Extensiones** → **Apps Script** → **Activadores** (⏰)
- Verifica que el trigger esté activo
- Revisa el historial de ejecuciones para ver errores

### "Los permisos no funcionan"
- Cierra sesión de Google y vuelve a autorizar
- Verifica que tu cuenta tenga permisos de edición en el Sheet

---

## 📱 Compartir el Sheet

Puedes compartir el Google Sheet normalmente:
- Otros usuarios verán los datos
- Solo tú (propietario) puedes ejecutar las actualizaciones manuales
- Las actualizaciones automáticas seguirán funcionando aunque lo compartas

---

## 🎯 Siguientes Pasos

Una vez configurado, puedes:
- 📊 Crear gráficos basados en los datos
- 📈 Usar tablas dinámicas para análisis
- 📧 Configurar alertas de stock bajo por email
- 🔗 Conectar con otras hojas de Google Workspace

---

¿Necesitas ayuda? Revisa los logs en **Extensiones** → **Apps Script** → **Ejecuciones**
