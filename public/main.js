// === NexVoz · sitio de la agencia ===

// Año dinámico en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// Envío del formulario de leads al backend (mismo origen).
const form = document.getElementById('lead-form');
const msg = document.getElementById('form-msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form).entries());
  try {
    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
  } catch (err) {
    // Si la web se publica sin backend, el formulario igual confirma al usuario.
    console.warn('Backend no disponible, lead solo en consola:', datos);
  }
  form.reset();
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 6000);
});

// Animación de aparición al hacer scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add('visible')),
  { threshold: 0.12 }
);
document.querySelectorAll('section > div').forEach((el) => {
  el.classList.add('fade-in');
  io.observe(el);
});
