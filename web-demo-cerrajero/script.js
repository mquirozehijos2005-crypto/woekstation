// === Cerraj24 (demo cerrajería) ===
// Captura de leads de urgencia. Cambia el número y, si tienes backend, la URL.

const WHATSAPP_NEGOCIO = '56900000000';      // <- número del cerrajero
const ENVIAR_AL_BACKEND = false;             // <- ponlo en true cuando tengas backend
const BACKEND_URL = 'http://localhost:3000/api/urgencia';

const form = document.getElementById('form-urgencia');
const msg = document.getElementById('msg-urgencia');
const wa = document.getElementById('wa-urgencia');

function armarTextoWhatsApp(d) {
  return `Hola! Necesito un cerrajero.%0A` +
    `Servicio: ${d.tipo}%0A` +
    `Urgencia: ${d.urgencia}%0A` +
    `Comuna: ${d.comuna}%0A` +
    `Nombre: ${d.nombre}%0A` +
    `Teléfono: ${d.telefono}`;
}

// Mantiene el link de WhatsApp actualizado mientras escribe
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
    console.log('Lead de urgencia capturado:', datos);
  }

  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 6000);
});
