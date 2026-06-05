/**
 * NexVoz — Motor de plantilla de cliente.
 * --------------------------------------------------------------------------
 * Renderiza un sitio web completo a partir de la configuración definida en
 * window.NEGOCIO (archivo config.js de cada cliente). Para crear un cliente
 * nuevo solo necesitas copiar una carpeta de cliente y editar su config.js.
 * Este archivo (el "motor") no se toca.
 *
 * Modos de acción (config.accion):
 *   "pedido"   -> catálogo de productos con carrito  -> POST /api/pedido
 *   "cita"     -> formulario de agendamiento         -> POST /api/cita
 *   "urgencia" -> formulario de contacto rápido      -> POST /api/urgencia
 *   "lead"     -> formulario de contacto general     -> POST /api/lead
 */
(function () {
  'use strict';

  const N = window.NEGOCIO || {};
  const color = N.color || '#4f46e5';
  const colorOscuro = N.colorOscuro || '#111827';
  const tel = N.telefono || '+56900000000';
  const wsp = (N.whatsapp || '56900000000').replace(/\D/g, '');
  const moneda = (n) => '$' + Number(n || 0).toLocaleString('es-CL');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const ENDPOINTS = { pedido: '/api/pedido', cita: '/api/cita', urgencia: '/api/urgencia', lead: '/api/lead' };
  const accion = ENDPOINTS[N.accion] ? N.accion : 'lead';
  const endpoint = ENDPOINTS[accion];

  // ----- <head>: título, favicon, variables CSS -----
  document.title = `${N.nombre || 'Mi Negocio'} · ${N.sector || ''}`.trim();
  const inicial = (N.nombre || 'N').trim().charAt(0).toUpperCase();
  const favSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect width='48' height='48' rx='12' fill='${color}'/><text x='24' y='34' font-size='26' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='bold'>${inicial}</text></svg>`;
  const fav = document.createElement('link');
  fav.rel = 'icon';
  fav.href = 'data:image/svg+xml,' + encodeURIComponent(favSvg);
  document.head.appendChild(fav);
  const root = document.documentElement;
  root.style.setProperty('--c', color);
  root.style.setProperty('--cd', colorOscuro);

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    html { scroll-behavior: smooth; }
    .btn-primary { background-color: var(--c); }
    .text-primary { color: var(--c); }
    .border-primary { border-color: var(--c); }
    .bg-soft { background-color: color-mix(in srgb, var(--c) 10%, white); }
    .item-card { transition: transform .2s ease, box-shadow .2s ease; }
    .item-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px -12px rgba(0,0,0,.25); }
    a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--c); outline-offset: 2px; }
  `;
  document.head.appendChild(styleEl);

  // ----- Secciones -----
  const stats = (N.stats || []).map((s) =>
    `<div><span class="block text-2xl font-extrabold text-slate-900">${esc(s.n)}</span><span class="text-sm text-slate-500">${esc(s.label)}</span></div>`
  ).join('');

  const hero = `
    <section class="bg-soft">
      <div class="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          ${N.badge ? `<span class="inline-block text-xs font-bold px-3 py-1 rounded-full text-primary bg-soft">${esc(N.badge)}</span>` : ''}
          <h1 class="mt-4 text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">${esc(N.tagline || N.nombre)}</h1>
          <p class="mt-4 text-lg text-slate-600">${esc(N.descripcion || '')}</p>
          <div class="mt-7 flex flex-col sm:flex-row gap-3">
            <a href="tel:${esc(tel)}" class="btn-primary rounded-full text-white px-7 py-3.5 text-center font-semibold shadow-lg">📞 Llamar ahora</a>
            <a href="#accion" class="rounded-full border border-slate-300 px-7 py-3.5 text-center font-semibold text-slate-700 hover:border-primary hover:text-primary transition">${esc(N.ctaSecundario || 'Contactar')}</a>
          </div>
          ${stats ? `<div class="mt-7 flex gap-6 text-sm text-slate-500">${stats}</div>` : ''}
        </div>
        <div class="aspect-square rounded-3xl shadow-2xl flex items-center justify-center text-[9rem]" style="background:linear-gradient(135deg, var(--c), var(--cd));">${esc(N.emoji || '🏪')}</div>
      </div>
    </section>`;

  let catalogo = '';
  if (Array.isArray(N.catalogo) && N.catalogo.length) {
    const tarjetas = N.catalogo.map((p, i) => `
      <div class="item-card rounded-2xl bg-white border border-slate-100 p-5 shadow-sm ${accion === 'pedido' ? 'cursor-pointer' : ''}" ${accion === 'pedido' ? `data-idx="${i}"` : ''}>
        ${p.emoji ? `<div class="text-4xl">${esc(p.emoji)}</div>` : ''}
        <h3 class="mt-3 font-bold text-slate-800">${esc(p.nombre)}</h3>
        ${p.desc ? `<p class="text-sm text-slate-500 mt-1">${esc(p.desc)}</p>` : ''}
        <div class="mt-3 flex items-center justify-between">
          ${p.precio != null ? `<span class="font-extrabold text-primary">${moneda(p.precio)}</span>` : '<span></span>'}
          ${accion === 'pedido' ? '<span class="btn-primary rounded-full text-white text-xs font-semibold px-3 py-1.5">Agregar +</span>' : ''}
        </div>
      </div>`).join('');
    catalogo = `
      <section id="catalogo" class="py-16 bg-white">
        <div class="max-w-5xl mx-auto px-5">
          <h2 class="text-3xl font-extrabold text-center text-slate-900">${esc(N.catalogoTitulo || (accion === 'pedido' ? 'Nuestro menú' : 'Nuestros servicios'))}</h2>
          ${accion === 'pedido' ? '<p class="text-center text-slate-500 mt-2">Toca un producto para agregarlo a tu pedido.</p>' : ''}
          <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${tarjetas}</div>
        </div>
      </section>`;
  }

  const opciones = (arr) => (arr || []).map((o) => `<option>${esc(o)}</option>`).join('');
  const nombresCatalogo = (N.catalogo || []).map((p) => p.nombre);

  let accionHTML = '';
  if (accion === 'pedido') {
    accionHTML = `
      <div class="bg-white text-slate-800 rounded-3xl p-6 text-left shadow-xl max-w-lg mx-auto">
        <h3 class="font-bold text-lg">Tu pedido</h3>
        <ul id="carrito" class="mt-4 space-y-2 text-sm min-h-[60px]"><li class="text-slate-400">Aún no has agregado nada.</li></ul>
        <div class="mt-4 pt-4 border-t flex justify-between font-bold text-lg"><span>Total</span><span id="total">$0</span></div>
        <button id="enviar" class="btn-primary mt-5 w-full rounded-full text-white px-6 py-3.5 font-semibold">Enviar pedido</button>
        <a href="tel:${esc(tel)}" class="mt-3 block rounded-full border border-primary text-primary px-6 py-3 text-center font-semibold">📞 Prefiero llamar</a>
        <p id="ok-msg" class="mt-3 text-center text-sm font-semibold hidden" style="color:var(--c)">✓ ¡Pedido enviado! El local lo recibió.</p>
      </div>`;
  } else if (accion === 'cita') {
    accionHTML = `
      <form id="form" class="bg-white rounded-3xl p-6 shadow-xl max-w-lg mx-auto text-left text-slate-800">
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2"><label class="block text-sm font-medium mb-1">Servicio</label><select name="servicio" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">${opciones(nombresCatalogo)}</select></div>
          <div><label class="block text-sm font-medium mb-1">Día preferido</label><input name="fecha" type="date" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></div>
          <div><label class="block text-sm font-medium mb-1">Teléfono</label><input name="paciente_telefono" required placeholder="+56 9 ..." class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></div>
          <div class="sm:col-span-2"><label class="block text-sm font-medium mb-1">Nombre</label><input name="paciente_nombre" required placeholder="Tu nombre" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></div>
        </div>
        <button type="submit" class="btn-primary mt-5 w-full rounded-full text-white px-6 py-3.5 font-semibold">Solicitar hora</button>
        <a id="wa" href="#" class="mt-3 block rounded-full border border-primary text-primary px-6 py-3 text-center font-semibold">O agendar por WhatsApp</a>
        <p id="ok-msg" class="mt-3 text-center text-sm font-semibold hidden" style="color:var(--c)">✓ ¡Solicitud recibida! Te confirmamos pronto.</p>
      </form>`;
  } else if (accion === 'urgencia') {
    accionHTML = `
      <form id="form" class="bg-white rounded-3xl p-6 shadow-xl max-w-lg mx-auto text-left text-slate-800">
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2"><label class="block text-sm font-medium mb-1">¿Qué necesitas?</label><select name="tipo_problema" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">${opciones(nombresCatalogo.length ? nombresCatalogo : ['Consulta'])}</select></div>
          <div><label class="block text-sm font-medium mb-1">Comuna / ubicación</label><input name="comuna" required placeholder="Ej: Ñuñoa" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></div>
          <div><label class="block text-sm font-medium mb-1">Urgencia</label><select name="nivel_urgencia" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"><option>Urgente (ahora)</option><option>Hoy</option><option>Puede esperar</option></select></div>
          <div><label class="block text-sm font-medium mb-1">Nombre</label><input name="cliente_nombre" required placeholder="Nombre" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></div>
          <div><label class="block text-sm font-medium mb-1">Teléfono</label><input name="cliente_telefono" required placeholder="+56 9 ..." class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></div>
        </div>
        <button type="submit" class="btn-primary mt-5 w-full rounded-full text-white px-6 py-3.5 font-semibold">Pedir que me llamen</button>
        <a id="wa" href="#" class="mt-3 block rounded-full border border-primary text-primary px-6 py-3 text-center font-semibold">O escríbenos por WhatsApp</a>
        <p id="ok-msg" class="mt-3 text-center text-sm font-semibold hidden" style="color:var(--c)">✓ ¡Recibido! Te contactamos enseguida.</p>
      </form>`;
  } else {
    accionHTML = `
      <form id="form" class="bg-white rounded-3xl p-6 shadow-xl max-w-lg mx-auto text-left text-slate-800">
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Nombre</label><input name="nombre" required placeholder="Tu nombre" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></div>
          <div><label class="block text-sm font-medium mb-1">Teléfono</label><input name="telefono" required placeholder="+56 9 ..." class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></div>
          <div class="sm:col-span-2"><label class="block text-sm font-medium mb-1">Mensaje</label><input name="mensaje" placeholder="¿En qué te ayudamos?" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></div>
        </div>
        <button type="submit" class="btn-primary mt-5 w-full rounded-full text-white px-6 py-3.5 font-semibold">Enviar</button>
        <a id="wa" href="#" class="mt-3 block rounded-full border border-primary text-primary px-6 py-3 text-center font-semibold">O escríbenos por WhatsApp</a>
        <p id="ok-msg" class="mt-3 text-center text-sm font-semibold hidden" style="color:var(--c)">✓ ¡Gracias! Te contactamos pronto.</p>
      </form>`;
  }

  const seccionAccion = `
    <section id="accion" class="py-16" style="background-color:var(--cd);">
      <div class="max-w-3xl mx-auto px-5 text-center text-white">
        <h2 class="text-3xl font-extrabold">${esc(N.accionTitulo || (accion === 'pedido' ? 'Haz tu pedido' : accion === 'cita' ? 'Agenda tu hora' : 'Contáctanos'))}</h2>
        <p class="mt-2 text-white/80">${esc(N.accionTexto || 'Llama y nuestra recepcionista con IA te atiende al instante, o usa este formulario.')}</p>
        <div class="mt-8">${accionHTML}</div>
      </div>
    </section>`;

  const footer = `
    <footer class="py-10 text-center text-sm text-slate-500 bg-slate-50">
      <p class="font-extrabold text-slate-800 text-lg">${esc(N.emoji || '')} ${esc(N.nombre)}</p>
      <p class="mt-2">${[N.direccion, N.horario, '📞 ' + tel].filter(Boolean).map(esc).join(' · ')}</p>
      <p class="mt-4 text-slate-400">Sitio y recepcionista IA por <span class="font-semibold text-slate-600">NexVoz</span></p>
    </footer>`;

  const nav = `
    <div class="text-center text-xs py-2 text-white" style="background-color:var(--cd);">Demo de NexVoz · <a href="/" class="underline">Volver al sitio de la agencia</a></div>
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <nav class="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#" class="font-extrabold text-xl text-slate-900">${esc(N.emoji || '')} ${esc(N.nombre)}</a>
        <a href="tel:${esc(tel)}" class="btn-primary rounded-full text-white px-5 py-2.5 text-sm font-semibold">📞 Llamar</a>
      </nav>
    </header>`;

  document.getElementById('app').innerHTML = nav + hero + catalogo + seccionAccion + footer;

  // ----- Interacción -----
  async function enviar(payload) {
    payload.negocio = N.nombre;
    payload.canal = 'web';
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      return r.ok;
    } catch (e) {
      return false;
    }
  }
  const mostrarOk = () => {
    const m = document.getElementById('ok-msg');
    if (m) { m.classList.remove('hidden'); setTimeout(() => m.classList.add('hidden'), 6000); }
  };

  if (accion === 'pedido') {
    const carrito = [];
    const total = () => carrito.reduce((s, p) => s + (p.precio || 0), 0);
    const ul = document.getElementById('carrito');
    const elTotal = document.getElementById('total');
    function render() {
      if (!carrito.length) { ul.innerHTML = '<li class="text-slate-400">Aún no has agregado nada.</li>'; elTotal.textContent = '$0'; return; }
      ul.innerHTML = carrito.map((p, i) => `<li class="flex justify-between items-center"><span>${esc(p.emoji || '')} ${esc(p.nombre)}</span><span class="flex items-center gap-3"><b>${moneda(p.precio)}</b><button data-rm="${i}" class="text-primary font-bold" aria-label="Quitar">✕</button></span></li>`).join('');
      elTotal.textContent = moneda(total());
      ul.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { carrito.splice(Number(b.dataset.rm), 1); render(); }));
    }
    document.querySelectorAll('[data-idx]').forEach((card) =>
      card.addEventListener('click', () => { carrito.push(N.catalogo[Number(card.dataset.idx)]); render(); }));
    document.getElementById('enviar').addEventListener('click', async () => {
      if (!carrito.length) return;
      const payload = { tipo_entrega: 'delivery', items: carrito.map((p) => ({ nombre: p.nombre, cantidad: 1, precio_unitario: p.precio })), total_clp: total() };
      const ok = await enviar(payload);
      if (!ok) {
        const lineas = carrito.map((p) => `- ${p.nombre} (${moneda(p.precio)})`).join('%0A');
        window.open(`https://wa.me/${wsp}?text=Hola! Quiero pedir:%0A${lineas}%0ATotal: ${moneda(total())}`, '_blank');
      }
      carrito.length = 0; render(); mostrarOk();
    });
    render();
  } else {
    const form = document.getElementById('form');
    const wa = document.getElementById('wa');
    const textoWsp = (d) => 'Hola! ' + Object.entries(d).map(([k, v]) => `${k}: ${v}`).join('%0A');
    const actualizarWa = () => { if (wa) wa.href = `https://wa.me/${wsp}?text=${textoWsp(Object.fromEntries(new FormData(form).entries()))}`; };
    form.addEventListener('input', actualizarWa); actualizarWa();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ok = await enviar(Object.fromEntries(new FormData(form).entries()));
      if (!ok && wa) window.open(wa.href, '_blank');
      form.reset(); mostrarOk();
    });
  }

  // Carga el widget de recepcionista IA gratis (voz en el navegador).
  var vz = document.createElement('script');
  vz.src = '/plantilla/voz.js';
  document.body.appendChild(vz);
})();
