// === Pizzería Don Beto (demo) ===
// Esta misma estructura sirve de plantilla para cualquier restaurante:
// solo cambia el arreglo MENU y el número de WhatsApp.

const WHATSAPP_NEGOCIO = '56900000000'; // <- cambiar por el del cliente

const MENU = [
  { id: 1, nombre: 'Pizza Margarita', desc: 'Tomate, mozzarella y albahaca fresca', precio: 8990, emoji: '🍕' },
  { id: 2, nombre: 'Pizza Pepperoni', desc: 'Doble pepperoni y mozzarella', precio: 10990, emoji: '🍕' },
  { id: 3, nombre: 'Pizza Cuatro Quesos', desc: 'Mozzarella, azul, parmesano y de cabra', precio: 11990, emoji: '🧀' },
  { id: 4, nombre: 'Pizza Vegetariana', desc: 'Pimentón, champiñón, cebolla y aceitunas', precio: 10490, emoji: '🥬' },
  { id: 5, nombre: 'Empanada de queso', desc: 'Crujiente, recién horneada', precio: 2500, emoji: '🥟' },
  { id: 6, nombre: 'Bebida 1.5L', desc: 'Línea Coca-Cola', precio: 2990, emoji: '🥤' },
];

const carrito = [];
const fmt = (n) => '$' + n.toLocaleString('es-CL');

// Render del menú
const grid = document.getElementById('menu-grid');
grid.innerHTML = MENU.map((p) => `
  <div class="item-card rounded-2xl bg-masa-50 border border-masa-100 p-5" data-id="${p.id}">
    <div class="text-4xl">${p.emoji}</div>
    <h3 class="mt-3 font-bold">${p.nombre}</h3>
    <p class="text-sm text-masa-900/60 mt-1">${p.desc}</p>
    <div class="mt-3 flex items-center justify-between">
      <span class="font-extrabold text-tomate-600">${fmt(p.precio)}</span>
      <span class="rounded-full bg-tomate-600 text-white text-xs font-semibold px-3 py-1.5">Agregar +</span>
    </div>
  </div>
`).join('');

// Agregar al carrito
grid.querySelectorAll('.item-card').forEach((card) => {
  card.addEventListener('click', () => {
    const id = Number(card.dataset.id);
    const prod = MENU.find((p) => p.id === id);
    carrito.push(prod);
    render();
  });
});

// Render del carrito
const ulCarrito = document.getElementById('carrito');
const elTotal = document.getElementById('total');
const btnWhats = document.getElementById('btn-whatsapp');

function render() {
  if (carrito.length === 0) {
    ulCarrito.innerHTML = '<li class="text-masa-900/40">Aún no has agregado nada.</li>';
    elTotal.textContent = '$0';
    return;
  }
  ulCarrito.innerHTML = carrito.map((p, i) => `
    <li class="flex justify-between items-center">
      <span>${p.emoji} ${p.nombre}</span>
      <span class="flex items-center gap-3">
        <b>${fmt(p.precio)}</b>
        <button data-rm="${i}" class="text-tomate-600 font-bold" aria-label="Quitar">✕</button>
      </span>
    </li>`).join('');

  const total = carrito.reduce((s, p) => s + p.precio, 0);
  elTotal.textContent = fmt(total);

  // Quitar item
  ulCarrito.querySelectorAll('[data-rm]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      carrito.splice(Number(b.dataset.rm), 1);
      render();
    });
  });

  // Link de WhatsApp con el pedido
  const lineas = carrito.map((p) => `- ${p.nombre} (${fmt(p.precio)})`).join('%0A');
  const texto = `Hola! Quiero hacer un pedido:%0A${lineas}%0ATotal: ${fmt(total)}`;
  btnWhats.href = `https://wa.me/${WHATSAPP_NEGOCIO}?text=${texto}`;
}

render();
