# Kit Completo — Agencia de Automatización IA + Desarrollo Web (Chile)

Kit listo para lanzar tu agencia que ofrece a PYMEs y negocios locales:
1. **Páginas web optimizadas para conversión.**
2. **Agente de voz con IA** que contesta el teléfono 24/7, toma pedidos / agenda citas y avisa al dueño.

Todo está pensado para el mercado chileno (precios en **CLP**) y para que puedas
arrancar **sin presupuesto publicitario**.

---

## ¿Qué hay en este kit?

```
woekstation/
├── README.md                     ← estás aquí (guía maestra)
├── COMO-FUNCIONA.md              ← ⭐ cómo conectar todo y que funcione de verdad
│
├── web-agencia/                  ← TU sitio web para vender el servicio
│
├── web-demo-restaurante/         ← Demo nicho 1: pedidos (🍕)
├── web-demo-clinica/             ← Demo nicho 2: citas (🦷)
├── web-demo-cerrajero/           ← Demo nicho 3: urgencias (🔧)
│
├── agente-voz-ia/                ← El cerebro del agente de voz
│   ├── prompt-sistema.md         ← guion para RESTAURANTE (pedidos)
│   ├── prompt-clinica.md         ← guion para CLÍNICA (citas)
│   ├── prompt-cerrajero.md       ← guion para CERRAJERO (urgencias)
│   ├── vapi-config.json          ← configuración + herramientas (tools)
│   └── guia-configuracion.md     ← paso a paso para montarlo
│
├── marca/                        ← 🎨 identidad de marca (logo SVG + guía)
│   ├── logo.svg
│   └── identidad-marca.md
│
├── backend-integracion/          ← Conecta la llamada con tu base de datos y WhatsApp
│   ├── server.js                 ← servidor Node (sin dependencias externas)
│   ├── package.json
│   ├── public/dashboard.html     ← panel con pestañas (pedidos/citas/urgencias)
│   └── README.md
│
└── documentos-negocio/
    ├── precios-y-paquetes-CLP.md       ← cuánto cobrar (pesos chilenos)
    ├── scripts-prospeccion.md          ← cómo conseguir tus primeros 3 clientes
    ├── plan-de-lanzamiento-30-dias.md
    ├── propuesta-comercial-plantilla.md ← 📄 propuesta para enviar a clientes
    └── contrato-servicio-plantilla.md   ← 📄 contrato de servicio (referencial)
```

## Las 3 circunstancias cubiertas

| Circunstancia | Web demo | Guion de IA | Endpoint |
|---------------|----------|-------------|----------|
| 🍕 Restaurante (pedidos) | `web-demo-restaurante/` | `prompt-sistema.md` | `/api/pedido` |
| 🦷 Clínica (citas) | `web-demo-clinica/` | `prompt-clinica.md` | `/api/cita` |
| 🔧 Cerrajero (urgencias) | `web-demo-cerrajero/` | `prompt-cerrajero.md` | `/api/urgencia` |

> 👉 **Para hacer funcionar todo de punta a punta, lee `COMO-FUNCIONA.md`.**

---

## Orden recomendado para arrancar (resumen de 30 días)

| Semana | Qué hacer | Carpeta |
|--------|-----------|---------|
| 1 | Publica la web de tu agencia y define tu nicho | `web-agencia/` |
| 1 | Monta el agente de voz demo | `agente-voz-ia/` |
| 2 | Conecta el backend (pedido → base de datos → WhatsApp) | `backend-integracion/` |
| 2 | Personaliza la demo de nicho | `web-demo-restaurante/` |
| 3-4 | Prospecta y cierra tus primeros clientes | `documentos-negocio/` |

---

## Cómo abrir las webs (sin saber programar)

1. Entra a la carpeta `web-agencia/`.
2. Abre `index.html` en cualquier navegador (doble clic).
3. Para publicarla gratis: arrastra la carpeta a **Netlify Drop** (https://app.netlify.com/drop) o súbela a **Vercel**.

## Cómo levantar el backend

Ver instrucciones en `backend-integracion/README.md`. Resumen:
```bash
cd backend-integracion
node server.js
```
Luego abre http://localhost:3000/dashboard.html para ver los pedidos.

---

## Stack tecnológico usado (todo económico/gratis para empezar)

- **Web:** HTML + Tailwind (CDN) → cero costo, deploy gratis en Netlify/Vercel.
- **Agente de voz:** Vapi (recomendado) o Retell AI.
- **Telefonía / WhatsApp:** Twilio.
- **Integración:** este backend en Node.js (puedes migrar a n8n/Make luego).
- **Base de datos:** archivo local para empezar; migra a Airtable o Postgres al crecer.

> Importante: las llaves/credenciales (API keys de Vapi, Twilio, etc.) se configuran
> con **variables de entorno**. Nunca las escribas dentro del código ni las subas a GitHub.
