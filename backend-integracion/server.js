/**
 * Backend de Integración — NexVoz
 * --------------------------------
 * Recibe los pedidos/leads desde el agente de voz IA (Vapi/Retell),
 * los guarda en una "base de datos" (archivo JSON) y notifica al dueño
 * del negocio por WhatsApp (Twilio) o Telegram.
 *
 * Hecho con Node nativo: NO requiere `npm install`.
 * Arrancar con:  node server.js
 *
 * Configuración por variables de entorno (todas opcionales para probar):
 *   PORT                     -> puerto (default 3000)
 *   WEBHOOK_SECRET           -> token compartido con Vapi para validar llamadas
 *   TELEGRAM_BOT_TOKEN       -> token del bot de Telegram
 *   TELEGRAM_CHAT_ID         -> chat/grupo donde avisar
 *   TWILIO_ACCOUNT_SID       -> SID de Twilio
 *   TWILIO_AUTH_TOKEN        -> token de Twilio
 *   TWILIO_WHATSAPP_FROM     -> ej: whatsapp:+14155238886
 *   DUENO_WHATSAPP_TO        -> ej: whatsapp:+569XXXXXXXX
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const DB_FILE = path.join(__dirname, 'pedidos.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// ---------- "Base de datos" simple en archivo JSON ----------
function leerDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { pedidos: [], leads: [] };
  }
}
function guardarDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ---------- Utilidades HTTP ----------
function enviarJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-webhook-secret',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(body);
}

function leerBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({ _raw: data }); }
    });
  });
}

const clp = (n) => '$' + Number(n || 0).toLocaleString('es-CL');

// ---------- Notificaciones ----------
function notificarTelegram(texto) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return Promise.resolve(false);

  const payload = JSON.stringify({ chat_id: chatId, text: texto, parse_mode: 'HTML' });
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  };
  return new Promise((resolve) => {
    const r = https.request(options, (resp) => { resp.on('data', () => {}); resp.on('end', () => resolve(true)); });
    r.on('error', (e) => { console.error('Telegram error:', e.message); resolve(false); });
    r.write(payload); r.end();
  });
}

function notificarWhatsAppTwilio(texto) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.DUENO_WHATSAPP_TO;
  if (!sid || !token || !from || !to) return Promise.resolve(false);

  const form = new URLSearchParams({ From: from, To: to, Body: texto }).toString();
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const options = {
    hostname: 'api.twilio.com',
    path: `/2010-04-01/Accounts/${sid}/Messages.json`,
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(form),
    },
  };
  return new Promise((resolve) => {
    const r = https.request(options, (resp) => { resp.on('data', () => {}); resp.on('end', () => resolve(true)); });
    r.on('error', (e) => { console.error('Twilio error:', e.message); resolve(false); });
    r.write(form); r.end();
  });
}

async function avisarAlDueno(texto) {
  const okTg = await notificarTelegram(texto);
  const okWa = await notificarWhatsAppTwilio(texto);
  if (!okTg && !okWa) {
    console.log('\n🔔 (Notificación simulada — configura Telegram/Twilio para envíos reales)\n' + texto + '\n');
  }
  return okTg || okWa;
}

// ---------- Formato del mensaje de pedido ----------
function formatearPedido(p) {
  const items = (p.items || [])
    .map((i) => `  • ${i.cantidad || 1}x ${i.nombre}${i.precio_unitario ? ' (' + clp(i.precio_unitario) + ')' : ''}`)
    .join('\n');
  return [
    '🍕 NUEVO PEDIDO',
    `Cliente: ${p.cliente_nombre || 's/n'}`,
    `Teléfono: ${p.cliente_telefono || 's/n'}`,
    `Entrega: ${p.tipo_entrega || 's/n'}${p.direccion ? ' — ' + p.direccion : ''}`,
    'Productos:',
    items || '  (sin detalle)',
    `Total: ${clp(p.total_clp)}`,
    `Pago: ${p.forma_pago || 's/n'}`,
    p.notas ? `Notas: ${p.notas}` : '',
  ].filter(Boolean).join('\n');
}

// ---------- Validación opcional del secreto ----------
function secretoValido(req) {
  if (!WEBHOOK_SECRET) return true; // si no se configuró, no se valida (modo prueba)
  const enviado = req.headers['x-webhook-secret'] || req.headers['x-vapi-secret'];
  return enviado === WEBHOOK_SECRET;
}

// ---------- Servir archivos estáticos (dashboard) ----------
function servirEstatico(res, urlPath) {
  let file = urlPath === '/' ? '/dashboard.html' : urlPath;
  const full = path.join(PUBLIC_DIR, path.normalize(file).replace(/^(\.\.[/\\])+/, ''));
  if (!full.startsWith(PUBLIC_DIR)) return enviarJSON(res, 403, { error: 'forbidden' });
  fs.readFile(full, (err, data) => {
    if (err) return enviarJSON(res, 404, { error: 'no encontrado' });
    const ext = path.extname(full);
    const tipo = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : ext === '.js' ? 'text/javascript' : 'text/plain';
    res.writeHead(200, { 'Content-Type': tipo + '; charset=utf-8' });
    res.end(data);
  });
}

// ---------- Servidor ----------
const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // CORS preflight
  if (req.method === 'OPTIONS') return enviarJSON(res, 204, {});

  // --- API: registrar pedido (lo llama la herramienta de Vapi) ---
  if (req.method === 'POST' && pathname === '/api/pedido') {
    if (!secretoValido(req)) return enviarJSON(res, 401, { error: 'secreto inválido' });
    const body = await leerBody(req);
    // Vapi puede envolver los argumentos: aceptamos ambos formatos.
    const datos = body.message?.toolCalls?.[0]?.function?.arguments || body.arguments || body;
    const pedido = {
      id: 'PED-' + Date.now(),
      fecha: new Date().toISOString(),
      estado: 'nuevo',
      ...datos,
    };
    const db = leerDB();
    db.pedidos.unshift(pedido);
    guardarDB(db);
    await avisarAlDueno(formatearPedido(pedido));
    console.log('✅ Pedido registrado:', pedido.id);
    // Respuesta que la IA puede leerle al cliente
    return enviarJSON(res, 200, {
      result: `Pedido ${pedido.id} registrado correctamente. Total ${clp(pedido.total_clp)}.`,
    });
  }

  // --- API: registrar lead (desde la web de la agencia) ---
  if (req.method === 'POST' && pathname === '/api/lead') {
    const body = await leerBody(req);
    const lead = { id: 'LEAD-' + Date.now(), fecha: new Date().toISOString(), ...body };
    const db = leerDB();
    db.leads.unshift(lead);
    guardarDB(db);
    await avisarAlDueno(`📩 NUEVO LEAD\nNombre: ${lead.nombre || 's/n'}\nNegocio: ${lead.negocio || 's/n'}\nTel: ${lead.telefono || 's/n'}\nRubro: ${lead.rubro || 's/n'}`);
    return enviarJSON(res, 200, { ok: true, id: lead.id });
  }

  // --- API: webhook general de Vapi (eventos: fin de llamada, etc.) ---
  if (req.method === 'POST' && pathname === '/api/vapi-webhook') {
    const body = await leerBody(req);
    const tipo = body.message?.type || 'desconocido';
    console.log('📞 Evento Vapi:', tipo);
    // Aquí podrías guardar transcripciones, grabaciones, etc.
    return enviarJSON(res, 200, { received: true });
  }

  // --- API: listar pedidos y leads (para el dashboard) ---
  if (req.method === 'GET' && pathname === '/api/pedidos') {
    return enviarJSON(res, 200, leerDB());
  }

  // --- Salud ---
  if (req.method === 'GET' && pathname === '/api/health') {
    return enviarJSON(res, 200, { ok: true, ts: Date.now() });
  }

  // --- Estáticos / dashboard ---
  if (req.method === 'GET') return servirEstatico(res, pathname);

  enviarJSON(res, 404, { error: 'ruta no encontrada' });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Backend NexVoz corriendo en http://localhost:${PORT}`);
  console.log(`   Dashboard:      http://localhost:${PORT}/dashboard.html`);
  console.log(`   Webhook pedido: POST http://localhost:${PORT}/api/pedido`);
  const notif = process.env.TELEGRAM_BOT_TOKEN ? 'Telegram' : process.env.TWILIO_ACCOUNT_SID ? 'WhatsApp/Twilio' : 'NINGUNA (modo simulado)';
  console.log(`   Notificaciones: ${notif}\n`);
});
