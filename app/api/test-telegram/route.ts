import { NextResponse } from 'next/server'

export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return NextResponse.json({
      error: 'Variables de entorno faltantes',
      botToken: botToken ? 'OK' : 'FALTA',
      chatId: chatId ? 'OK' : 'FALTA'
    }, { status: 500 })
  }

  try {
    // Intentar enviar un mensaje de prueba
    const mensaje = `🧪 *PRUEBA DE BOT*\n\n✅ El bot está funcionando correctamente!\n\n🕐 ${new Date().toLocaleString('es-AR')}`

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
          parse_mode: 'Markdown',
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        error: 'Error de Telegram API',
        statusCode: response.status,
        telegramError: data,
        botToken: botToken.substring(0, 10) + '...',
        chatId: chatId
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente!',
      data
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Error al enviar mensaje',
      details: error.message,
      botToken: botToken.substring(0, 10) + '...',
      chatId: chatId
    }, { status: 500 })
  }
}
