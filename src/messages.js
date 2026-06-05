'use strict';

/** Formatea las notificaciones que recibe el dueño del negocio. */

const clp = (n) => '$' + Number(n || 0).toLocaleString('es-CL');

function formatearPedido(p) {
  const items = (p.items || [])
    .map((i) => `  - ${i.cantidad || 1}x ${i.nombre}${i.precio_unitario ? ' (' + clp(i.precio_unitario) + ')' : ''}`)
    .join('\n');
  return [
    'NUEVO PEDIDO',
    p.negocio ? `Negocio: ${p.negocio}` : '',
    `Cliente: ${p.cliente_nombre || 's/n'}`,
    `Telefono: ${p.cliente_telefono || 's/n'}`,
    `Entrega: ${p.tipo_entrega || 's/n'}${p.direccion ? ' - ' + p.direccion : ''}`,
    'Productos:',
    items || '  (sin detalle)',
    `Total: ${clp(p.total_clp)}`,
    `Pago: ${p.forma_pago || 's/n'}`,
    p.notas ? `Notas: ${p.notas}` : '',
  ].filter(Boolean).join('\n');
}

function formatearCita(c) {
  return [
    'NUEVA CITA',
    c.negocio ? `Negocio: ${c.negocio}` : '',
    `Paciente: ${c.paciente_nombre || c.nombre || 's/n'}`,
    `Telefono: ${c.paciente_telefono || c.telefono || 's/n'}`,
    `Servicio: ${c.servicio || 's/n'}`,
    `Profesional: ${c.profesional || 'cualquiera'}`,
    `Dia/Hora: ${[c.fecha, c.hora].filter(Boolean).join(' ') || 's/f'}`,
    c.notas ? `Notas: ${c.notas}` : '',
  ].filter(Boolean).join('\n');
}

function formatearUrgencia(u) {
  const nivel = (u.nivel_urgencia || u.urgencia || '').toLowerCase();
  const alerta = nivel.includes('urg') || nivel.includes('ahora') ? '*** URGENTE *** ' : '';
  return [
    `${alerta}NUEVA SOLICITUD`,
    `Problema: ${u.tipo_problema || u.tipo || 's/n'}`,
    `Ubicacion: ${u.comuna || 's/n'}${u.direccion ? ' - ' + u.direccion : ''}`,
    `Urgencia: ${u.nivel_urgencia || u.urgencia || 's/n'}`,
    `Cliente: ${u.cliente_nombre || u.nombre || 's/n'}`,
    `Telefono: ${u.cliente_telefono || u.telefono || 's/n'}`,
    u.notas ? `Notas: ${u.notas}` : '',
    'Llamar al cliente ahora.',
  ].filter(Boolean).join('\n');
}

function formatearLead(l) {
  return [
    'NUEVO LEAD (web)',
    `Nombre: ${l.nombre || 's/n'}`,
    `Negocio: ${l.negocio || 's/n'}`,
    `Telefono: ${l.telefono || 's/n'}`,
    `Rubro: ${l.rubro || 's/n'}`,
  ].join('\n');
}

module.exports = { clp, formatearPedido, formatearCita, formatearUrgencia, formatearLead };
