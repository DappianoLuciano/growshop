# 📊 Configurar Google Sheets - GrowShop

## ✅ Deploy Completado

Tu endpoint ya está funcionando en producción:
- **URL**: https://agrogrowarg.com
- **Endpoint**: https://agrogrowarg.com/api/sheets/productos?key=growshop-secret-key-2024
- **Estado**: ✅ Activo
- **Productos disponibles**: 131 productos con 131 variantes

---

## 🚀 Pasos para Configurar Google Sheets

### Paso 1: Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala como "Stock GrowShop" (o el nombre que prefieras)

---

### Paso 2: Abrir Google Apps Script

1. En tu Google Sheet, ve al menú **Extensiones**
2. Haz clic en **Apps Script**
3. Borra todo el código que aparece por defecto

---

### Paso 3: Copiar el Script

Copia y pega el siguiente código (también está en [google-apps-script.js](google-apps-script.js)):

\`\`\`javascript
// ============= CONFIGURACIÓN =============
const API_URL = 'https://agrogrowarg.com/api/sheets/productos?key=growshop-secret-key-2024';
const SHEET_NAME = 'Productos';

// ============= FUNCIÓN PRINCIPAL =============
function actualizarProductos() {
  try {
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

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() > 0) {
      sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();
    }

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

    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4CAF50')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

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

      sheet.getRange(2, 4, rows.length, 1).setNumberFormat('$#,##0.00');
      sheet.getRange(2, 6, rows.length, 1).setNumberFormat('$#,##0.00');
      sheet.getRange(2, 9, rows.length, 2).setHorizontalAlignment('center');

      const stockRange = sheet.getRange(2, 9, rows.length, 1);
      const rules = sheet.getConditionalFormatRules();

      const rule1 = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberEqualTo(0)
        .setBackground('#FFCDD2')
        .setRanges([stockRange])
        .build();

      const rule2 = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberBetween(1, 5)
        .setBackground('#FFF9C4')
        .setRanges([stockRange])
        .build();

      const rule3 = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThan(5)
        .setBackground('#C8E6C9')
        .setRanges([stockRange])
        .build();

      rules.push(rule1, rule2, rule3);
      sheet.setConditionalFormatRules(rules);
    }

    sheet.autoResizeColumns(1, headers.length);
    sheet.setFrozenRows(1);

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
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'actualizarProductos') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

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

---

### Paso 4: Guardar el Script

1. Haz clic en el icono del disquete 💾 o presiona **Ctrl+S** (Cmd+S en Mac)
2. Dale un nombre al proyecto, por ejemplo: "GrowShop Sync"
3. Cierra el editor de Apps Script

---

### Paso 5: Ejecutar por Primera Vez

1. Vuelve a abrir el editor de Apps Script (**Extensiones** → **Apps Script**)
2. En el menú desplegable de funciones, selecciona `actualizarProductos`
3. Haz clic en el botón **Ejecutar** (▶️)
4. Google te pedirá permisos:
   - Haz clic en **"Revisar permisos"**
   - Selecciona tu cuenta de Google
   - Haz clic en **"Avanzado"**
   - Haz clic en **"Ir a [nombre del proyecto] (no seguro)"**
   - Haz clic en **"Permitir"**

5. Espera unos segundos y verás un mensaje: **"✅ Productos actualizados correctamente"**
6. Vuelve a tu Google Sheet y verás los 131 productos con todos sus datos

---

### Paso 6: Configurar Actualización Automática

1. En tu Google Sheet, verás un nuevo menú **🌱 GrowShop** (si no lo ves, recarga la página)
2. Haz clic en **🌱 GrowShop** → **⚙️ Configurar Auto-Actualización**
3. Verás un mensaje: **"✅ Actualización automática configurada"**

¡Listo! Ahora tu Google Sheet se actualizará automáticamente cada 30 minutos con los datos en tiempo real de tu base de datos.

---

## 🎨 Características del Sheet

### Colores Automáticos por Stock:
- 🔴 **Rojo** (Stock = 0): Sin stock disponible
- 🟡 **Amarillo** (Stock 1-5): Stock bajo, necesita reposición
- 🟢 **Verde** (Stock > 5): Stock normal

### Columnas Disponibles:
1. **Producto**: Nombre del producto
2. **Marca**: Marca del producto
3. **Categoría**: Categoría asignada
4. **Precio**: Precio regular (formato $)
5. **En Oferta**: "Sí" o "No"
6. **Precio Oferta**: Precio rebajado si aplica
7. **SKU**: Código único de la variante
8. **Variante**: Descripción (tamaño/capacidad/potencia)
9. **Stock**: Stock de esta variante específica (con colores)
10. **Stock Total**: Stock total del producto (todas variantes)
11. **Última Actualización**: Timestamp de la última sincronización

---

## 🔧 Personalización

### Cambiar frecuencia de actualización

Edita esta línea en el script:
\`\`\`javascript
.everyMinutes(30)  // Cambia 30 por los minutos que quieras
\`\`\`

**Opciones**:
- `.everyMinutes(15)` → Cada 15 minutos
- `.everyHours(1)` → Cada 1 hora  
- `.everyDays(1).atHour(9)` → Diariamente a las 9 AM

### Cambiar nombre de la pestaña

Edita esta línea:
\`\`\`javascript
const SHEET_NAME = 'Productos';  // Cambia por el nombre que quieras
\`\`\`

---

## 🐛 Solución de Problemas

### Error "Clave de API inválida"
- La clave ya está configurada correctamente en el script
- No modifiques la URL ni la clave

### No aparece el menú "🌱 GrowShop"
- Cierra y vuelve a abrir el Google Sheet
- O recarga la página (F5)

### No se actualiza automáticamente
1. Ve a **Extensiones** → **Apps Script**
2. Haz clic en el icono del reloj ⏰ (Activadores)
3. Verifica que haya un trigger de `actualizarProductos` cada 30 minutos
4. Si no está, vuelve a ejecutar la función `configurarActualizacionAutomatica`

---

## 📱 Compartir el Sheet

Puedes compartir el Google Sheet normalmente:
- ✅ Otros usuarios verán los datos actualizados
- ✅ Solo tú (propietario) puedes ejecutar las actualizaciones manuales
- ✅ Las actualizaciones automáticas seguirán funcionando aunque lo compartas

---

## 🎯 Próximas Mejoras Posibles

- 📊 Crear gráficos de stock por categoría
- 📈 Tablas dinámicas para análisis de inventario
- 📧 Alertas automáticas por email cuando un producto esté sin stock
- 🔔 Notificaciones de productos con stock bajo

---

## ℹ️ Información Técnica

- **Endpoint API**: https://agrogrowarg.com/api/sheets/productos
- **Método**: GET
- **Autenticación**: API Key en query string
- **Formato**: JSON
- **Actualización**: Cada 30 minutos (configurable)
- **Total de productos**: 131

---

¿Necesitas ayuda? Revisa los logs de ejecución en **Extensiones** → **Apps Script** → **Ejecuciones** (icono del reloj con flecha circular)
