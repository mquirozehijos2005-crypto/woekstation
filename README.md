# Kit Completo — Agencia de Automatización IA + Desarrollo Web (Chile)

Kit listo para lanzar tu agencia que ofrece a PYMEs y negocios locales:
1. **Páginas web optimizadas para conversión.**
2. **Agente de voz con IA** que contesta el teléfono 24/7, toma pedidos / agenda citas y avisa al dueño.

Todo está pensado para el mercado chileno (precios en **CLP**) y para que puedas
arrancar **sin presupuesto publicitario**.

---

## ¿Qué hay en este kit?

```
agencia-aaa/
├── README.md                     ← estás aquí (guía maestra)
│
├── web-agencia/                  ← TU sitio web para vender el servicio
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── web-demo-restaurante/         ← Demo de nicho para mostrar a prospectos
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── agente-voz-ia/                ← El cerebro del agente de voz
│   ├── prompt-sistema.md         ← copia/pega esto en Vapi o Retell
│   ├── vapi-config.json          ← configuración + herramientas (tools)
│   └── guia-configuracion.md     ← paso a paso para montarlo
│
├── backend-integracion/          ← Conecta la llamada con tu base de datos y WhatsApp
│   ├── server.js                 ← servidor Node (sin dependencias externas)
│   ├── package.json
│   ├── public/dashboard.html     ← panel para ver los pedidos
│   └── README.md
│
└── documentos-negocio/
    ├── precios-y-paquetes-CLP.md ← cuánto cobrar (pesos chilenos)
    ├── scripts-prospeccion.md    ← cómo conseguir tus primeros 3 clientes
    └── plan-de-lanzamiento-30-dias.md
```

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
