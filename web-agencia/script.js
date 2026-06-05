// === NexVoz · interacción de la landing ===

// Año dinámico en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// Manejo del formulario de leads.
// Por defecto solo muestra confirmación. Si configuras tu backend,
// cambia ENVIAR_AL_BACKEND a true y ajusta la URL.
const ENVIAR_AL_BACKEND = false;
const BACKEND_URL = 'http://localhost:3000/api/lead';

const form = document.getElementById('lead-form');
const msg = document.getElementById('form-msg');

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
    } catch (err) {
      console.warn('No se pudo enviar al backend:', err);
    }
  } else {
    // Alternativa sin backend: abre WhatsApp con el mensaje prellenado.
    const texto = `Hola, soy ${datos.nombre} de ${datos.negocio} (${datos.rubro}). Quiero una demo. Tel: ${datos.telefono}`;
    // Descomenta para abrir WhatsApp automáticamente:
    // window.open(`https://wa.me/56900000000?text=${encodeURIComponent(texto)}`, '_blank');
    console.log('Lead capturado:', datos);
  }

  form.reset();
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 6000);
});

// Animación de aparición al hacer scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('section > div').forEach((el) => {
  el.classList.add('fade-in');
  observer.observe(el);
});
