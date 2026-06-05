// === Clínica Sonrisa (demo dental) ===
// Agendamiento de citas. Cambia el número y, si tienes backend, la URL.

const WHATSAPP_NEGOCIO = '56900000000';   // <- número de la clínica
const ENVIAR_AL_BACKEND = false;          // <- ponlo en true cuando tengas backend
const BACKEND_URL = 'http://localhost:3000/api/cita';

const form = document.getElementById('form-cita');
const msg = document.getElementById('msg-cita');
const wa = document.getElementById('wa-cita');

function armarTextoWhatsApp(d) {
  return `Hola! Quiero agendar una hora.%0A` +
    `Servicio: ${d.servicio}%0A` +
    `Profesional: ${d.profesional}%0A` +
    `Día preferido: ${d.fecha || 'a coordinar'}%0A` +
    `Nombre: ${d.nombre}%0A` +
    `Teléfono: ${d.telefono}`;
}

function actualizarWhatsApp() {
  const d = Object.fromEntries(new FormData(form).entries());
  wa.href = `https://wa.me/${WHATSAPP_NEGOCIO}?text=${armarTextoWhatsApp(d)}`;
}
form.addEventListener('input', actualizarWhatsApp);
actualizarWhatsApp();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form).entries());

  if (ENVIAR_AL_BACKEND) {
    try {
      await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
    } catch (err) { console.warn('No se pudo enviar al backend:', err); }
  } else {
    console.log('Solicitud de cita capturada:', datos);
  }

  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 6000);
});
