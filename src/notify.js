'use strict';

/**
 * Notificaciones al dueño del negocio.
 * Soporta Telegram y WhatsApp (Twilio). Si no hay credenciales configuradas,
 * imprime la notificación en consola (modo simulado), de modo que el sistema
 * funciona igual durante el desarrollo.
 */

const https = require('https');

function pedirHttps(options, payload) {
  return new Promise((resolve) => {
    const req = https.request(options, (resp) => {
      resp.on('data', () => {});
      resp.on('end', () => resolve(resp.statusCode >= 200 && resp.statusCode < 300));
    });
    req.on('error', (e) => {
      console.error('Error de notificación:', e.message);
      resolve(false);
    });
    if (payload) req.write(payload);
    req.end();
  });
}

function notificarTelegram(texto) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return Promise.resolve(false);

  const payload = JSON.stringify({ chat_id: chatId, text: texto });
  return pedirHttps(
    {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    },
    payload
  );
}

function notificarWhatsApp(texto) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.DUENO_WHATSAPP_TO;
  if (!sid || !token || !from || !to) return Promise.resolve(false);

  const payload = new URLSearchParams({ From: from, To: to, Body: texto }).toString();
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  return pedirHttps(
    {
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${sid}/Messages.json`,
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    payload
  );
}

async function notificar(texto) {
  const [okTg, okWa] = await Promise.all([notificarTelegram(texto), notificarWhatsApp(texto)]);
  if (!okTg && !okWa) {
    console.log('\n🔔 (Notificación simulada — configura Telegram/Twilio para envíos reales)\n' + texto + '\n');
  }
  return okTg || okWa;
}

function canalActivo() {
  if (process.env.TELEGRAM_BOT_TOKEN) return 'Telegram';
  if (process.env.TWILIO_ACCOUNT_SID) return 'WhatsApp/Twilio';
  return 'NINGUNO (modo simulado)';
}

module.exports = { notificar, canalActivo };
