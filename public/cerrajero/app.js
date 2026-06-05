// === Cerraj24 (demo cerrajería) ===
const WHATSAPP_NEGOCIO = '56900000000';

const form = document.getElementById('form-urgencia');
const msg = document.getElementById('msg-urgencia');
const wa = document.getElementById('wa-urgencia');

function textoWhatsApp(d) {
  return `Hola! Necesito un cerrajero.%0A` +
    `Servicio: ${d.tipo}%0AUrgencia: ${d.urgencia}%0AComuna: ${d.comuna}%0A` +
    `Nombre: ${d.nombre}%0ATeléfono: ${d.telefono}`;
}
function actualizarWhatsApp() {
  wa.href = `https://wa.me/${WHATSAPP_NEGOCIO}?text=${textoWhatsApp(Object.fromEntries(new FormData(form).entries()))}`;
}
form.addEventListener('input', actualizarWhatsApp);
actualizarWhatsApp();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form).entries());
  const urgencia = {
    tipo_problema: datos.tipo,
    comuna: datos.comuna,
    nivel_urgencia: datos.urgencia,
    cliente_nombre: datos.nombre,
    cliente_telefono: datos.telefono,
    canal: 'web',
  };
  try {
    await fetch('/api/urgencia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(urgencia) });
  } catch (err) {
    console.warn('Backend no disponible:', urgencia);
  }
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 6000);
});
