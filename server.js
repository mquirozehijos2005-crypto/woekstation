'use strict';

/**
 * NexVoz — Servidor único.
 * --------------------------------------------------------------------------
 * Sirve el sitio de la agencia, las demos por sector y el panel de gestión
 * (carpeta /public), y expone la API que recibe los datos desde el agente
 * de voz IA (Vapi/Retell) y desde los formularios web.
 *
 * Sin dependencias externas. Arrancar con:  npm start   (o: node server.js)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const store = require('./src/store');
const { notificar, canalActivo } = require('./src/notify');
const msg = require('./src/messages');

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

// ---------------------------------------------------------------- utilidades

function enviarJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-webhook-secret',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(JSON.stringify(data));
}

function leerBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e6) req.destroy(); // protección básica
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({ _raw: data }); }
    });
  });
}

// Vapi envuelve los argumentos de la herramienta; aceptamos varios formatos.
function extraerArgumentos(body) {
  return (
    body?.message?.toolCalls?.[0]?.function?.arguments ||
    body?.message?.toolCallList?.[0]?.function?.arguments ||
    body?.arguments ||
    body
  );
}

function secretoValido(req) {
  if (!WEBHOOK_SECRET) return true; // sin secreto configurado => modo prueba
  const enviado = req.headers['x-webhook-secret'] || req.headers['x-vapi-secret'];
  return enviado === WEBHOOK_SECRET;
}

const nuevoId = (pre) => `${pre}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// --------------------------------------------------------- archivos estáticos

function servirEstatico(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const rel = decodeURIComponent(pathname);

  // Resuelve la ruta probando, en orden: archivo exacto, /ruta.html y /ruta/index.html.
  const candidatos = [];
  if (rel.endsWith('/')) {
    candidatos.push(rel + 'index.html');
  } else if (path.extname(rel)) {
    candidatos.push(rel);
  } else {
    candidatos.push(rel + '.html', rel + '/index.html');
  }

  for (const c of candidatos) {
    const full = path.join(PUBLIC_DIR, path.normalize(c));
    if (!full.startsWith(PUBLIC_DIR)) continue;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      res.writeHead(200, { 'Content-Type': (MIME[path.extname(full)] || 'application/octet-stream') + '; charset=utf-8' });
      return res.end(fs.readFileSync(full));
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404</h1><p>Página no encontrada. <a href="/">Volver al inicio</a></p>');
}

// ------------------------------------------------------------- registro común

async function registrar(req, res, { coleccion, prefijo, formatear, mensajeOk }) {
  if (!secretoValido(req)) return enviarJSON(res, 401, { error: 'secreto inválido' });
  const datos = extraerArgumentos(await leerBody(req));
  const registro = { id: nuevoId(prefijo), fecha: new Date().toISOString(), estado: 'nuevo', ...datos };
  store.agregar(coleccion, registro);
  await notificar(formatear(registro));
  console.log(`✅ ${coleccion}: ${registro.id}`);
  return enviarJSON(res, 200, { ok: true, id: registro.id, result: mensajeOk(registro) });
}

// ------------------------------------------------------------------- servidor

const rutas = {
  'POST /api/pedido': (req, res) =>
    registrar(req, res, {
      coleccion: 'pedidos', prefijo: 'PED', formatear: msg.formatearPedido,
      mensajeOk: (r) => `Pedido ${r.id} registrado. Total ${msg.clp(r.total_clp)}.`,
    }),
  'POST /api/cita': (req, res) =>
    registrar(req, res, {
      coleccion: 'citas', prefijo: 'CITA', formatear: msg.formatearCita,
      mensajeOk: (r) => `Cita ${r.id} agendada para ${[r.fecha, r.hora].filter(Boolean).join(' ') || 'coordinar'}.`,
    }),
  'POST /api/urgencia': (req, res) =>
    registrar(req, res, {
      coleccion: 'urgencias', prefijo: 'URG', formatear: msg.formatearUrgencia,
      mensajeOk: (r) => `Solicitud ${r.id} registrada. El técnico llamará en minutos.`,
    }),
  'POST /api/lead': (req, res) =>
    registrar(req, res, {
      coleccion: 'leads', prefijo: 'LEAD', formatear: msg.formatearLead,
      mensajeOk: () => 'Gracias, te contactaremos pronto.',
    }),
  'GET /api/data': (_req, res) => enviarJSON(res, 200, store.leerTodo()),
  'GET /api/health': (_req, res) => enviarJSON(res, 200, { ok: true, ts: Date.now() }),
  'POST /api/vapi-webhook': async (req, res) => {
    const body = await leerBody(req);
    console.log('📞 Evento Vapi:', body?.message?.type || 'desconocido');
    enviarJSON(res, 200, { received: true });
  },
};

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') return enviarJSON(res, 204, {});

  const handler = rutas[`${req.method} ${pathname}`];
  if (handler) return handler(req, res);

  if (req.method === 'GET') return servirEstatico(req, res);
  return enviarJSON(res, 404, { error: 'ruta no encontrada' });
});

server.listen(PORT, () => {
  console.log(`\n🚀 NexVoz en http://localhost:${PORT}`);
  console.log(`   Agencia:    http://localhost:${PORT}/`);
  console.log(`   Demos:      /restaurante  /clinica  /cerrajero`);
  console.log(`   Panel:      http://localhost:${PORT}/dashboard`);
  console.log(`   API:        POST /api/pedido | /api/cita | /api/urgencia | /api/lead`);
  console.log(`   Notif.:     ${canalActivo()}\n`);
});

module.exports = server;
