# Guia de Entrega a un Cliente Nuevo (Playbook de la Agencia)

Tu negocio: **NexVoz (la agencia/vendedor)** le entrega el servicio a empresas cliente
(restaurantes, comida rapida, farmacias, clinicas, oficios...). Cada empresa es un cliente
al que le instalas su sitio + su recepcionista IA y le cobras setup + mensualidad.

Esta guia es el paso a paso para montar y entregar a CADA cliente nuevo, rapido.

---

## Modelo recomendado: una instalacion por cliente

Cada empresa cliente es **independiente**: su propio sitio, su propio numero de
telefono IA y sus notificaciones llegan al WhatsApp del DUENO de ESA empresa.

Ventajas:
- Datos separados (no se mezclan clientes).
- El dueno recibe SUS avisos en SU WhatsApp.
- Puedes entregar, cobrar y dar de baja a cada cliente por separado.

> A escala (muchos clientes) puedes centralizar todo en un solo backend usando el campo
> `negocio` que ya guarda cada registro. Para empezar, una instalacion por cliente es
> mas simple y limpio.

---

## Paso a paso para un cliente nuevo (30-60 min)

### 1. Crea la carpeta del cliente (su sitio web)
- Copia una carpeta de `public/` parecida al rubro del cliente (ej. `public/restaurante`).
- Renombrala con el nombre del cliente (ej. `public/pizzeria-luigi`).
- Abre su `config.js` y edita SOLO esos datos:
  - `nombre`, `sector`, `emoji`, `color`, `colorOscuro`
  - `telefono`, `whatsapp`, `direccion`, `horario`
  - `tagline`, `descripcion`, `badge`, `stats`
  - `accion`: `pedido` (resto/comida/farmacia), `cita` (clinica/peluqueria),
    `urgencia` (oficios) o `lead` (generico)
  - `catalogo`: el menu/productos/servicios reales del cliente
- Listo: el sitio queda armado solo. No tocas HTML ni codigo.

### 2. Configura las notificaciones del cliente
- En el `.env` de ESA instalacion pon el WhatsApp/Telegram del DUENO del negocio
  (no el tuyo): `DUENO_WHATSAPP_TO` o `TELEGRAM_CHAT_ID`.
- Asi cada pedido/cita/urgencia le llega directo al cliente.

### 3. Monta la recepcionista IA del cliente (Vapi)
- Crea un asistente nuevo en Vapi.
- Pega el guion segun el rubro (`agente-voz-ia/`):
  - Restaurante / comida rapida -> `prompt-sistema.md`
  - Farmacia -> `prompt-farmacia.md`
  - Clinica -> `prompt-clinica.md`
  - Oficios -> `prompt-cerrajero.md`
- Reemplaza los [CORCHETES] con los datos del cliente (nombre, menu, horario...).
- Crea la herramienta (tool) apuntando a la URL del backend del cliente:
  `/api/pedido`, `/api/cita` o `/api/urgencia`.

### 4. Conecta el numero de telefono
- Compra un numero en Twilio (o usa el desvio de llamadas del numero actual del cliente).
- Asocialo al asistente en Vapi.

### 5. Despliega y prueba
- Sube esa instalacion a Render/Railway (o tu hosting) con su `.env`.
- Prueba de punta a punta: llama, haz un pedido/cita, revisa que llegue al WhatsApp
  del dueno y aparezca en su panel (`/dashboard`).

### 6. Entrega y cobra
- Muestra el sitio y la IA funcionando.
- Firma la propuesta y el contrato (ver `propuesta-comercial-plantilla.md` y
  `contrato-servicio-plantilla.md`).
- Cobra el setup por adelantado y activa la mensualidad.

---

## Checklist de entrega

- [ ] `config.js` del cliente completo y revisado (datos y catalogo reales).
- [ ] Colores y logo acordes a su marca.
- [ ] WhatsApp del DUENO configurado en el `.env`.
- [ ] Guion de IA personalizado y probado (suena natural, no inventa precios).
- [ ] Numero de telefono conectado y desvio activado.
- [ ] Prueba de punta a punta OK (llamada -> aviso -> panel).
- [ ] Propuesta y contrato firmados.
- [ ] Setup cobrado + mensualidad activada.

---

## Que mantiene la agencia
- Tu sitio de venta (`/`) para captar nuevos clientes.
- Las plantillas y guiones (este repo) como tu "fabrica" para producir cada cliente.
- El soporte mensual (por eso cobras la mensualidad recurrente).
