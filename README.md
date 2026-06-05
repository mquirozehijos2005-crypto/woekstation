# NexVoz — Agencia de Automatización con IA + Desarrollo Web (Chile)

Plataforma lista para lanzar una agencia que ofrece a PYMEs y negocios locales:

1. **Sitios web optimizados para conversión.**
2. **Recepcionista con IA** que atiende el teléfono 24/7, toma pedidos, agenda citas
   y captura urgencias, notificando al instante por WhatsApp/Telegram.

Todo pensado para el mercado chileno (precios en **CLP**) y para arrancar **sin
presupuesto publicitario**.

> 📋 **¿Por dónde empiezo?** Lee **`PASOS-PARA-FUNCIONAR.txt`** (guía completa paso a
> paso). Versión imprimible/PDF en `http://localhost:3000/guia` (botón "Guardar como PDF").

---

## ✅ Demo funcional en 1 comando

```bash
npm start
```

Luego abre en el navegador:

| URL | Qué es |
|-----|--------|
| http://localhost:3000/ | Sitio de la **agencia** (para vender) |
| http://localhost:3000/restaurante | Demo restaurante (pedidos) |
| http://localhost:3000/comida-rapida | Demo comida rápida (pedidos) |
| http://localhost:3000/farmacia | Demo farmacia (pedidos/despacho) |
| http://localhost:3000/clinica | Demo clínica (agenda de citas) |
| http://localhost:3000/cerrajero | Demo oficios (urgencias) |
| http://localhost:3000/dashboard | **Panel de gestión** en vivo |

> Los formularios de todas las webs envían los datos al backend y aparecen en el
> panel al instante. **No requiere `npm install`** (solo Node 18 o superior).

---

## Estructura del proyecto

```
woekstation/
├── server.js                 ← servidor único (sirve las webs + API)
├── package.json
├── .env.example              ← variables de entorno (notificaciones, secreto)
│
├── src/                      ← lógica del backend (modular y limpia)
│   ├── store.js              ← capa de datos (JSON; fácil de migrar)
│   ├── notify.js             ← notificaciones WhatsApp/Telegram
│   └── messages.js           ← formato de los avisos al dueño
│
├── data/                     ← base de datos local (se genera sola)
│
├── public/                   ← todo lo que se sirve por web
│   ├── index.html  main.js   ← sitio de la agencia
│   ├── dashboard.html        ← panel de gestión (multi-cliente)
│   ├── plantilla/            ← MOTOR de la plantilla (template.js) — no se toca
│   ├── restaurante/          ← cliente ejemplo (index.html + config.js)
│   ├── comida-rapida/        ← cliente ejemplo
│   ├── farmacia/             ← cliente ejemplo
│   ├── clinica/              ← cliente ejemplo
│   └── cerrajero/            ← cliente ejemplo
│
├── agente-voz-ia/            ← guiones del agente de voz (uno por rubro)
│   ├── prompt-sistema.md     ← restaurante / comida rápida (pedidos)
│   ├── prompt-farmacia.md    ← farmacia (pedidos/despacho)
│   ├── prompt-clinica.md     ← clínica (citas)
│   ├── prompt-cerrajero.md   ← oficios (urgencias)
│   ├── vapi-config.json
│   └── guia-configuracion.md
│
├── marca/                    ← identidad de marca (logo SVG + guía)
│
├── documentos-negocio/       ← precios CLP, prospección, propuesta, contrato
│   └── guia-entrega-cliente.md  ← ⭐ cómo montar y entregar a cada empresa
│
└── COMO-FUNCIONA.md          ← guía end-to-end para conectar todo
```

---

## 🏭 Crear un cliente nuevo (sin programar)

Eres la **agencia**: produces un sitio por cada empresa cliente editando **un solo archivo**.

1. Copia una carpeta de cliente parecida al rubro (ej. `public/restaurante`).
2. Renómbrala con el cliente (ej. `public/pizzeria-luigi`).
3. Edita **solo** su `config.js`: nombre, colores, teléfono, WhatsApp, catálogo y
   `accion` (`pedido` / `cita` / `urgencia` / `lead`).
4. Listo: el sitio queda armado por el motor (`plantilla/template.js`). No tocas código.

El paso a paso completo (IA, número, despliegue, cobro) está en
**`documentos-negocio/guia-entrega-cliente.md`**.

---

## Rubros y tipos de acción

| Rubro | Demo | Acción de la IA | Guion | Endpoint |
|-------|------|-----------------|-------|----------|
| Restaurante | `/restaurante` | Toma de pedidos | `prompt-sistema.md` | `/api/pedido` |
| Comida rápida | `/comida-rapida` | Toma de pedidos | `prompt-sistema.md` | `/api/pedido` |
| Farmacia | `/farmacia` | Pedido / despacho | `prompt-farmacia.md` | `/api/pedido` |
| Clínica / salud | `/clinica` | Agenda de citas | `prompt-clinica.md` | `/api/cita` |
| Oficios / urgencias | `/cerrajero` | Captura de leads | `prompt-cerrajero.md` | `/api/urgencia` |

> Se adapta a más rubros (veterinarias, peluquerías, talleres...) cambiando el `config.js`.

---

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/pedido` | Registra un pedido (lo llama el agente IA o la web) |
| POST | `/api/cita` | Registra una cita |
| POST | `/api/urgencia` | Registra una urgencia/lead de oficio |
| POST | `/api/lead` | Registra un lead desde el sitio de la agencia |
| GET | `/api/data` | Devuelve todos los registros (para el panel) |
| GET | `/api/health` | Estado del servicio |

---

## Notificaciones reales (opcional)

Copia `.env.example` a `.env`, completa tus credenciales y arranca con:

```bash
node --env-file=.env server.js
```

- **Telegram** (lo más rápido): `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`.
- **WhatsApp (Twilio):** variables `TWILIO_*` + `DUENO_WHATSAPP_TO`.

Sin credenciales, las notificaciones se imprimen en la consola (modo simulado),
así el sistema funciona igual mientras desarrollas.

---

## Publicar en producción (gratis)

- **Backend + webs juntos:** despliega en **Render** o **Railway**
  (comando de inicio `node server.js`, agrega las variables de entorno).
- **Solo las webs (estático):** puedes subir la carpeta `public/` a Netlify/Vercel;
  en ese caso los formularios usan WhatsApp como alternativa si no hay backend.

> Las credenciales (API keys de Vapi, Twilio, etc.) van **siempre** en variables de
> entorno. Nunca dentro del código ni subidas a GitHub.

---

## Stack

- **Web:** HTML + Tailwind (CDN) + JS — cero build, fácil de desplegar.
- **Backend:** Node.js nativo (sin dependencias).
- **Agente de voz:** Vapi (recomendado) o Retell AI · **Telefonía:** Twilio.
- **Datos:** archivo JSON local; migrable a Airtable/Postgres cambiando `src/store.js`.

👉 Para conectar el agente de voz real, lee **`COMO-FUNCIONA.md`**.
