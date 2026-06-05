/**
 * NexVoz — Recepcionista IA GRATIS en el navegador.
 * --------------------------------------------------------------------------
 * Usa la Web Speech API (incluida en el navegador): reconoce voz y habla,
 * SIN costo y SIN claves de API. Ideal para DEMOS y para vender.
 *
 * Conversa segun el rubro (window.NEGOCIO.accion) y, al terminar, envia el
 * resultado al backend (mismo origen) para que aparezca en /dashboard.
 *
 * Limitacion: el reconocimiento de voz funciona mejor en Chrome/Edge. Si el
 * navegador no lo soporta, el widget ofrece igual un chat escrito (tambien gratis).
 */
(function () {
  'use strict';
  var N = window.NEGOCIO || {};
  var accion = ['pedido', 'cita', 'urgencia', 'lead'].indexOf(N.accion) >= 0 ? N.accion : 'lead';
  var endpoints = { pedido: '/api/pedido', cita: '/api/cita', urgencia: '/api/urgencia', lead: '/api/lead' };
  var color = N.color || '#4f46e5';
  var norm = function (s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var puedeHablar = 'speechSynthesis' in window;
  var rec = null;
  if (SR) { rec = new SR(); rec.lang = 'es-CL'; rec.interimResults = false; rec.maxAlternatives = 1; }

  function hablar(texto) {
    if (!puedeHablar) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(texto);
      u.lang = 'es-CL';
      var v = window.speechSynthesis.getVoices().filter(function (x) { return /es/i.test(x.lang); })[0];
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  var fab = document.createElement('button');
  fab.textContent = '🎙️ Probar recepcionista IA';
  fab.setAttribute('aria-label', 'Probar recepcionista IA');
  fab.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;border:none;cursor:pointer;color:#fff;font-weight:700;font-family:inherit;padding:14px 18px;border-radius:999px;box-shadow:0 10px 25px -5px rgba(0,0,0,.35);background:' + color + ';';
  document.body.appendChild(fab);

  var panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;bottom:84px;right:20px;z-index:9999;width:340px;max-width:calc(100vw - 40px);background:#fff;border-radius:18px;box-shadow:0 20px 50px -12px rgba(0,0,0,.4);display:none;overflow:hidden;font-family:inherit;';
  panel.innerHTML =
    '<div style="background:' + color + ';color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">' +
      '<strong style="font-size:14px;">Recepcionista IA · ' + (N.nombre || '') + '</strong>' +
      '<button id="vz-x" aria-label="Cerrar" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer;">&#10005;</button>' +
    '</div>' +
    '<div id="vz-log" style="height:260px;overflow-y:auto;padding:14px;background:#f8fafc;font-size:13px;color:#0f172a;"></div>' +
    '<div style="display:flex;gap:6px;padding:10px;border-top:1px solid #eef2f7;">' +
      '<button id="vz-mic" title="Hablar" style="border:none;cursor:pointer;background:' + color + ';color:#fff;border-radius:10px;padding:0 12px;font-size:16px;">🎤</button>' +
      '<input id="vz-in" placeholder="Escribe o habla…" style="flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:8px 10px;font-size:13px;outline:none;" />' +
      '<button id="vz-send" style="border:none;cursor:pointer;background:#0f172a;color:#fff;border-radius:10px;padding:0 12px;font-size:13px;">&#10148;</button>' +
    '</div>' +
    '<div style="padding:0 12px 10px;font-size:10px;color:#94a3b8;">Demo gratis en tu navegador · NexVoz</div>';
  document.body.appendChild(panel);

  var log = panel.querySelector('#vz-log');
  var input = panel.querySelector('#vz-in');

  function burbuja(texto, lado) {
    var d = document.createElement('div');
    d.style.cssText = 'margin:6px 0;display:flex;' + (lado === 'user' ? 'justify-content:flex-end;' : '');
    d.innerHTML = '<span style="max-width:80%;padding:8px 12px;border-radius:14px;' +
      (lado === 'user' ? 'background:' + color + ';color:#fff;border-bottom-right-radius:4px;' : 'background:#fff;border:1px solid #eef2f7;color:#0f172a;border-bottom-left-radius:4px;') +
      '">' + texto + '</span>';
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function bot(texto) { burbuja(texto, 'bot'); hablar(texto); }

  var estado, datos, carrito;
  var catalogo = N.catalogo || [];
  var cierre = ['no', 'no mas', 'no gracias', 'eso es todo', 'eso seria todo', 'listo', 'nada mas', 'cerrar', 'pagar', 'eso'];

  function reiniciar() {
    datos = {}; carrito = [];
    log.innerHTML = '';
    if (accion === 'pedido') { estado = 'pedido'; bot('Hola, gracias por llamar a ' + (N.nombre || 'nuestro local') + '. ¿Qué le gustaría pedir hoy?'); }
    else if (accion === 'cita') { estado = 'servicio'; bot('Hola, le habla la recepcionista de ' + (N.nombre || 'la clínica') + '. ¿Para qué servicio desea agendar?'); }
    else if (accion === 'urgencia') { estado = 'problema'; bot('Hola, ' + (N.nombre || '') + ' le atiende. Tranquilo, le ayudamos. ¿Qué necesita?'); }
    else { estado = 'mensaje'; bot('Hola, gracias por contactar a ' + (N.nombre || 'nosotros') + '. ¿En qué le puedo ayudar?'); }
  }

  function buscarItems(texto) {
    var t = norm(texto), encontrados = [];
    catalogo.forEach(function (p) {
      var nombre = norm(p.nombre);
      var clave = nombre.split(' ').filter(function (w) { return w.length > 3; })[0] || nombre;
      if (t.indexOf(nombre) >= 0 || (clave && t.indexOf(clave) >= 0)) encontrados.push(p);
    });
    return encontrados;
  }
  var moneda = function (n) { return '$' + Number(n || 0).toLocaleString('es-CL'); };
  function total() { return carrito.reduce(function (s, p) { return s + (p.precio || 0); }, 0); }

  async function enviar(payload, mensajeFinal) {
    payload.negocio = N.nombre; payload.canal = 'demo-voz';
    try { await fetch(endpoints[accion], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); } catch (e) {}
    bot(mensajeFinal);
    estado = 'fin';
  }

  function procesar(texto) {
    var t = norm(texto);
    if (accion === 'pedido') {
      if (estado === 'pedido') {
        var items = buscarItems(texto);
        if (items.length) { items.forEach(function (p) { carrito.push(p); }); bot('Anotado: ' + items.map(function (p) { return p.nombre; }).join(', ') + '. ¿Desea algo más? Si no, dígame "eso es todo".'); }
        else if (cierre.indexOf(t) >= 0 && carrito.length) { estado = 'nombre'; bot('Perfecto. ¿A nombre de quién dejo el pedido?'); }
        else if (cierre.indexOf(t) >= 0 && !carrito.length) { bot('Aún no agrega productos. ¿Qué le gustaría pedir?'); }
        else { bot('No reconocí ese producto. Puede pedir: ' + catalogo.slice(0, 4).map(function (p) { return p.nombre; }).join(', ') + '…'); }
        return;
      }
      if (estado === 'nombre') { datos.cliente_nombre = texto; estado = 'telefono'; bot('Gracias ' + texto + '. ¿Me deja un teléfono de contacto?'); return; }
      if (estado === 'telefono') {
        datos.cliente_telefono = texto;
        return enviar({ cliente_nombre: datos.cliente_nombre, cliente_telefono: datos.cliente_telefono, tipo_entrega: 'delivery', items: carrito.map(function (p) { return { nombre: p.nombre, cantidad: 1, precio_unitario: p.precio }; }), total_clp: total() },
          'Listo. Su pedido por ' + moneda(total()) + ' quedó registrado. ¡Muchas gracias!');
      }
    } else if (accion === 'cita') {
      if (estado === 'servicio') { datos.servicio = texto; estado = 'fecha'; bot('Bien. ¿Qué día le acomoda?'); return; }
      if (estado === 'fecha') { datos.fecha = texto; estado = 'nombre'; bot('¿A nombre de quién agendo la hora?'); return; }
      if (estado === 'nombre') { datos.paciente_nombre = texto; estado = 'telefono'; bot('¿Y un teléfono de contacto?'); return; }
      if (estado === 'telefono') { datos.paciente_telefono = texto; return enviar(datos, 'Su hora para ' + datos.servicio + ' quedó solicitada. Le confirmaremos pronto. ¡Gracias!'); }
    } else if (accion === 'urgencia') {
      if (estado === 'problema') { datos.tipo_problema = texto; estado = 'comuna'; bot('Entiendo. ¿En qué comuna o dirección se encuentra?'); return; }
      if (estado === 'comuna') { datos.comuna = texto; estado = 'nombre'; bot('¿Su nombre, por favor?'); return; }
      if (estado === 'nombre') { datos.cliente_nombre = texto; estado = 'telefono'; bot('¿Y un teléfono para llamarle de inmediato?'); return; }
      if (estado === 'telefono') { datos.cliente_telefono = texto; datos.nivel_urgencia = 'Urgente'; return enviar(datos, 'Listo, registré su solicitud. Un técnico le llamará en minutos. ¡Quédese tranquilo!'); }
    } else {
      if (estado === 'mensaje') { datos.mensaje = texto; estado = 'nombre'; bot('Con gusto. ¿Su nombre?'); return; }
      if (estado === 'nombre') { datos.nombre = texto; estado = 'telefono'; bot('¿Y un teléfono de contacto?'); return; }
      if (estado === 'telefono') { datos.telefono = texto; return enviar(datos, 'Gracias. Registré su consulta y le contactaremos pronto.'); }
    }
    if (estado === 'fin') bot('¿Desea hacer otra consulta? Toque el micrófono o escriba.');
  }

  function enviarTexto(texto) {
    texto = (texto || '').trim();
    if (!texto) return;
    burbuja(texto, 'user');
    input.value = '';
    if (estado === 'fin') { reiniciar(); return; }
    setTimeout(function () { procesar(texto); }, 250);
  }

  fab.addEventListener('click', function () {
    var abierto = panel.style.display === 'block';
    panel.style.display = abierto ? 'none' : 'block';
    if (!abierto && !log.childNodes.length) reiniciar();
  });
  panel.querySelector('#vz-x').addEventListener('click', function () { panel.style.display = 'none'; if (window.speechSynthesis) window.speechSynthesis.cancel(); });
  panel.querySelector('#vz-send').addEventListener('click', function () { enviarTexto(input.value); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') enviarTexto(input.value); });

  var mic = panel.querySelector('#vz-mic');
  if (rec) {
    var escuchando = false;
    mic.addEventListener('click', function () { try { escuchando ? rec.stop() : rec.start(); } catch (e) {} });
    rec.onstart = function () { escuchando = true; mic.style.opacity = '0.5'; input.placeholder = 'Escuchando…'; };
    rec.onend = function () { escuchando = false; mic.style.opacity = '1'; input.placeholder = 'Escribe o habla…'; };
    rec.onresult = function (e) { enviarTexto(e.results[0][0].transcript); };
    rec.onerror = function () { escuchando = false; mic.style.opacity = '1'; };
  } else {
    mic.style.display = 'none';
  }
})();
