// ============= CONFIGURACIÓN =============
const API_URL = 'https://agrogrowarg.com/api/sheets/productos';
// Pegar acá el mismo valor que SHEETS_API_KEY en Vercel (mínimo 16 caracteres)
const API_KEY = 'PEGAR_AQUI_SHEETS_API_KEY';
const SHEET_NAME = 'Productos'; // Nombre de la pestaña

// ============= FUNCIÓN PRINCIPAL =============
function actualizarProductos() {
  try {
    // Hacer petición al API
    const response = UrlFetchApp.fetch(API_URL, {
      method: 'GET',
      headers: { 'x-api-key': API_KEY },
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    if (statusCode !== 200) {
      throw new Error(`Error en la petición: ${statusCode}`);
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
    infoCell.setValue(`✅ Actualizado: ${new Date().toLocaleString('es-AR')}`);
    infoCell.setFontSize(10);
    infoCell.setFontColor('#666666');

    SpreadsheetApp.getUi().alert(`✅ Productos actualizados correctamente\n\nTotal: ${productos.length} productos`);

  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Error al actualizar productos:\n${error.toString()}`);
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

  SpreadsheetApp.getUi().alert('✅ Actualización automática configurada\n\nSe actualizará cada 30 minutos');
}

// ============= MENÚ PERSONALIZADO =============
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🌱 GrowShop')
    .addItem('🔄 Actualizar Ahora', 'actualizarProductos')
    .addItem('⚙️ Configurar Auto-Actualización', 'configurarActualizacionAutomatica')
    .addToUi();
}
