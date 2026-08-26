# 📧 Sistema de Envío de Emails

## ¿Cómo funciona?

Cuando un administrador confirma un pedido (cambia el estado del pago a "APPROVED"), automáticamente se envía un email de confirmación al cliente con:

- Número de pedido
- Datos del cliente
- Dirección de envío o método de retiro
- Lista de productos
- Total del pedido
- Notas adicionales (si las hay)

## Configuración

### 1. API Key de Resend

Debes agregar tu API key de Resend en el archivo `.env`:

```env
RESEND_API_KEY="re_tu_api_key_aqui"
```

**Cómo obtener tu API key:**
1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta (gratis hasta 3,000 emails/mes)
3. En el dashboard, ve a "API Keys"
4. Crea una nueva API key y cópiala

### 2. Dominio Personalizado (REQUERIDO para enviar a clientes)

⚠️ **IMPORTANTE**: En el plan gratuito de Resend sin dominio verificado, **solo puedes enviar emails a tu propio email registrado en Resend** (el que usaste para crear la cuenta).

Para enviar emails a cualquier cliente:

1. En Resend, ve a "Domains"
2. Agrega tu dominio (necesitas tener un dominio propio)
3. Configura los registros DNS según las instrucciones:
   - **TXT** para verificación del dominio
   - **MX** para recibir emails
   - **TXT** para SPF (prevenir spam)
   - **TXT** para DKIM (autenticación)
4. Una vez verificado, actualiza el archivo `lib/email/send-order-confirmation.ts`:

```typescript
from: 'Grow Shop <pedidos@tudominio.com>'
```

**Para pruebas sin dominio:**
- Crea pedidos usando tu email registrado en Resend
- Así podrás ver cómo se ven los emails

## Archivos del Sistema

- **`lib/email/resend.ts`** - Configuración del cliente de Resend
- **`lib/email/templates/order-confirmation.ts`** - Plantilla HTML del email
- **`lib/email/send-order-confirmation.ts`** - Función para enviar emails
- **`app/api/orders/[id]/route.ts`** - Endpoint que envía el email al confirmar

## Personalización

### Cambiar el diseño del email

Edita el archivo `lib/email/templates/order-confirmation.ts` para modificar:
- Colores
- Logo
- Texto
- Estructura

### Cambiar cuándo se envía el email

Actualmente se envía cuando `paymentStatus === 'APPROVED'`. Si quieres cambiarlo, edita `app/api/orders/[id]/route.ts`.

## Pruebas

Para probar el envío de emails:

1. Crea un pedido desde el frontend
2. Ve al panel de administración
3. Encuentra el pedido en la lista
4. Cambia el estado del pago a "Aprobado"
5. El cliente recibirá el email automáticamente

## Troubleshooting

### El email no se envía

1. Verifica que `RESEND_API_KEY` esté correctamente configurada en `.env`
2. Revisa los logs del servidor para ver si hay errores
3. Verifica que el cliente tenga un email válido en la orden

### El email va a spam

1. Configura un dominio personalizado en Resend
2. Agrega registros SPF, DKIM y DMARC
3. Evita palabras spam en el asunto y contenido

### Error "RESEND_API_KEY no está configurada"

Asegúrate de:
1. Haber agregado la variable en `.env`
2. Reiniciar el servidor de desarrollo después de agregar la variable
