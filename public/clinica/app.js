// === Clínica Sonrisa (demo) ===
const WHATSAPP_NEGOCIO = '56900000000';

const form = document.getElementById('form-cita');
const msg = document.getElementById('msg-cita');
const wa = document.getElementById('wa-cita');

function textoWhatsApp(d) {
  return `Hola! Quiero agendar una hora.%0A` +
    `Servicio: ${d.servicio}%0AProfesional: ${d.profesional}%0A` +
    `Día preferido: ${d.fecha || 'a coordinar'}%0ANombre: ${d.nombre}%0ATeléfono: ${d.telefono}`;
}
function actualizarWhatsApp() {
  wa.href = `https://wa.me/${WHATSAPP_NEGOCIO}?text=${textoWhatsApp(Object.fromEntries(new FormData(form).entries()))}`;
}
form.addEventListener('input', actualizarWhatsApp);
actualizarWhatsApp();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form).entries());
  // Normaliza al formato que espera el backend.
  const cita = {
    paciente_nombre: datos.nombre,
    paciente_telefono: datos.telefono,
    servicio: datos.servicio,
    profesional: datos.profesional,
    fecha: datos.fecha,
    canal: 'web',
  };
  try {
    await fetch('/api/cita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cita) });
  } catch (err) {
    console.warn('Backend no disponible:', cita);
  }
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 6000);
});
