// === Pizzería Don Beto (demo restaurante) ===
// Plantilla reutilizable: cambia MENU y WHATSAPP_NEGOCIO para cada cliente.

const WHATSAPP_NEGOCIO = '56900000000';

const MENU = [
  { id: 1, nombre: 'Pizza Margarita', desc: 'Tomate, mozzarella y albahaca', precio: 8990, emoji: '🍕' },
  { id: 2, nombre: 'Pizza Pepperoni', desc: 'Doble pepperoni y mozzarella', precio: 10990, emoji: '🍕' },
  { id: 3, nombre: 'Pizza Cuatro Quesos', desc: 'Mozzarella, azul, parmesano y cabra', precio: 11990, emoji: '🧀' },
  { id: 4, nombre: 'Pizza Vegetariana', desc: 'Pimentón, champiñón, cebolla, aceitunas', precio: 10490, emoji: '🥬' },
  { id: 5, nombre: 'Empanada de queso', desc: 'Crujiente, recién horneada', precio: 2500, emoji: '🥟' },
  { id: 6, nombre: 'Bebida 1.5L', desc: 'Línea Coca-Cola', precio: 2990, emoji: '🥤' },
];

const carrito = [];
const fmt = (n) => '$' + n.toLocaleString('es-CL');

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
  </div>`).join('');

grid.querySelectorAll('.item-card').forEach((card) => {
  card.addEventListener('click', () => {
    carrito.push(MENU.find((p) => p.id === Number(card.dataset.id)));
    render();
  });
});

const ulCarrito = document.getElementById('carrito');
const elTotal = document.getElementById('total');
const btnEnviar = document.getElementById('btn-enviar');
const msgPedido = document.getElementById('msg-pedido');

function total() { return carrito.reduce((s, p) => s + p.precio, 0); }

function render() {
  if (carrito.length === 0) {
    ulCarrito.innerHTML = '<li class="text-masa-900/40">Aún no has agregado nada.</li>';
    elTotal.textContent = '$0';
    return;
  }
  ulCarrito.innerHTML = carrito.map((p, i) => `
    <li class="flex justify-between items-center"><span>${p.emoji} ${p.nombre}</span>
    <span class="flex items-center gap-3"><b>${fmt(p.precio)}</b>
    <button data-rm="${i}" class="text-tomate-600 font-bold" aria-label="Quitar">✕</button></span></li>`).join('');
  elTotal.textContent = fmt(total());
  ulCarrito.querySelectorAll('[data-rm]').forEach((b) =>
    b.addEventListener('click', () => { carrito.splice(Number(b.dataset.rm), 1); render(); }));
}

btnEnviar.addEventListener('click', async () => {
  if (carrito.length === 0) return;
  const pedido = {
    tipo_entrega: 'delivery',
    items: carrito.map((p) => ({ nombre: p.nombre, cantidad: 1, precio_unitario: p.precio })),
    total_clp: total(),
    canal: 'web',
  };
  try {
    await fetch('/api/pedido', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedido),
    });
    msgPedido.classList.remove('hidden');
  } catch (err) {
    // Sin backend: abre WhatsApp con el pedido.
    const lineas = carrito.map((p) => `- ${p.nombre} (${fmt(p.precio)})`).join('%0A');
    window.open(`https://wa.me/${WHATSAPP_NEGOCIO}?text=Hola! Quiero pedir:%0A${lineas}%0ATotal: ${fmt(total())}`, '_blank');
  }
  carrito.length = 0;
  render();
  setTimeout(() => msgPedido.classList.add('hidden'), 6000);
});

render();
