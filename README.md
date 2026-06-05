# NexVoz — Agencia de Automatización con IA + Desarrollo Web (Chile)

Plataforma lista para lanzar una agencia que ofrece a PYMEs y negocios locales:

1. **Sitios web optimizados para conversión.**
2. **Recepcionista con IA** que atiende el teléfono 24/7, toma pedidos, agenda citas
   y captura urgencias, notificando al instante por WhatsApp/Telegram.

Todo pensado para el mercado chileno (precios en **CLP**) y para arrancar **sin
presupuesto publicitario**.

---

## ✅ Demo funcional en 1 comando

```bash
npm start
```

Luego abre en el navegador:

| URL | Qué es |
|-----|--------|
| http://localhost:3000/ | Sitio de la **agencia** (para vender) |
| http://localhost:3000/restaurante | Demo restaurante (toma de pedidos) |
| http://localhost:3000/clinica | Demo clínica (agenda de citas) |
| http://localhost:3000/cerrajero | Demo cerrajero (urgencias) |
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
│   ├── dashboard.html        ← panel de gestión
│   ├── restaurante/          ← demo (index.html + app.js)
│   ├── clinica/              ← demo
│   └── cerrajero/            ← demo
│
├── agente-voz-ia/            ← el cerebro del agente de voz
│   ├── prompt-sistema.md     ← guion RESTAURANTE (pedidos)
│   ├── prompt-clinica.md     ← guion CLÍNICA (citas)
│   ├── prompt-cerrajero.md   ← guion CERRAJERO (urgencias)
│   ├── vapi-config.json      ← configuración + herramientas (tools)
│   └── guia-configuracion.md ← paso a paso para montarlo
│
├── marca/                    ← identidad de marca (logo SVG + guía)
│
├── documentos-negocio/       ← precios CLP, prospección, propuesta y contrato
│
└── COMO-FUNCIONA.md          ← guía end-to-end para conectar todo
```

---

## Las 3 circunstancias cubiertas

| Circunstancia | Demo web | Guion de IA | Endpoint API |
|---------------|----------|-------------|--------------|
| Restaurante (pedidos) | `/restaurante` | `prompt-sistema.md` | `POST /api/pedido` |
| Clínica (citas) | `/clinica` | `prompt-clinica.md` | `POST /api/cita` |
| Cerrajero (urgencias) | `/cerrajero` | `prompt-cerrajero.md` | `POST /api/urgencia` |

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
