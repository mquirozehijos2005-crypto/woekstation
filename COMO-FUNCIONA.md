# 🛠️ Cómo Funciona Todo (Guía de Operación Correcta)

Esta guía explica **cómo conectar las piezas para que el sistema funcione de verdad**,
con un cliente real, para las 3 circunstancias:

| Circunstancia | Web demo | Guion de IA | Endpoint backend |
|---------------|----------|-------------|------------------|
| 🍕 Restaurante (pedidos) | `web-demo-restaurante/` | `agente-voz-ia/prompt-sistema.md` | `/api/pedido` |
| 🦷 Clínica (citas) | `web-demo-clinica/` | `agente-voz-ia/prompt-clinica.md` | `/api/cita` |
| 🔧 Cerrajero (urgencias) | `web-demo-cerrajero/` | `agente-voz-ia/prompt-cerrajero.md` | `/api/urgencia` |

---

## 1. La idea en una imagen

```
   ┌─────────────┐     llama      ┌──────────────┐    webhook     ┌──────────────┐
   │   CLIENTE   │ ─────────────▶ │  Nº TELÉFONO │ ─────────────▶ │   AGENTE IA  │
   │  (teléfono) │                │   (Twilio)   │                │ (Vapi/Retell)│
   └─────────────┘                └──────────────┘                └──────┬───────┘
                                                                          │ llama a la herramienta
                                                                          │ (registrar_pedido / cita / urgencia)
                                                                          ▼
                                          ┌───────────────────────────────────────────┐
                                          │            TU BACKEND (server.js)           │
                                          │  1. Guarda en la base de datos              │
                                          │  2. Avisa al dueño por WhatsApp / Telegram  │
                                          │  3. Muestra todo en el dashboard            │
                                          └───────────────────────────────────────────┘
                                                                          │
                                                  ┌───────────────────────┴───────────────────────┐
                                                  ▼                                                 ▼
                                          📱 WhatsApp del dueño                         📋 Dashboard en vivo
```

**En palabras:** el cliente llama → la IA conversa y toma los datos → al confirmar,
la IA envía los datos a tu backend → el backend guarda y avisa al dueño al instante.

---

## 2. Las 4 piezas y qué hace cada una

1. **Número de teléfono (Twilio):** el número al que llaman los clientes.
2. **Agente de voz (Vapi):** la "inteligencia" que habla, entiende y decide cuándo
   guardar la información. Aquí pegas el **guion** (prompt) según la circunstancia.
3. **Backend (`backend-integracion/server.js`):** recibe los datos, los guarda y
   notifica al dueño. Es el "pegamento" del sistema.
4. **Notificación + Dashboard:** cómo se entera el dueño (WhatsApp/Telegram) y dónde
   ve el historial (`/dashboard.html`).

---

## 3. Puesta en marcha paso a paso (la primera vez)

### Paso A — Levanta el backend y hazlo público
El agente de voz vive en internet, así que necesita una URL pública para enviarte los datos.

1. Sube el backend a un hosting gratis (**Render** o **Railway**):
   - Conecta este repositorio.
   - Comando de inicio: `node server.js`
   - Agrega las variables de entorno (ver Paso C).
   - Te dará una URL tipo `https://tu-backend.onrender.com`.
2. **Para probar desde tu PC** sin hosting, usa ngrok:
   ```bash
   node server.js          # en una terminal
   npx ngrok http 3000     # en otra terminal → te da una URL pública temporal
   ```

> Anota tu URL pública. La llamaremos `URL_BACKEND`.

### Paso B — Crea el agente en Vapi
1. Crea cuenta en https://vapi.ai
2. "Assistants" → "Create Assistant".
3. En **System Prompt**, pega el guion de la circunstancia que vendes:
   - Restaurante → `prompt-sistema.md`
   - Clínica → `prompt-clinica.md`
   - Cerrajero → `prompt-cerrajero.md`
4. **Model:** OpenAI gpt-4o · **Transcriber:** Deepgram (idioma `es`) · **Voice:** una voz en español.
5. Crea la **herramienta (Tool / Function)** correspondiente:
   | Circunstancia | Nombre de la función | Server URL |
   |---------------|----------------------|------------|
   | Restaurante | `registrar_pedido` | `URL_BACKEND/api/pedido` |
   | Clínica | `agendar_cita` | `URL_BACKEND/api/cita` |
   | Cerrajero | `registrar_urgencia` | `URL_BACKEND/api/urgencia` |
   - Copia los parámetros (properties) desde `vapi-config.json` o desde cada prompt.
   - En "secret" del tool pon el mismo valor que tu `WEBHOOK_SECRET`.

### Paso C — Configura las notificaciones (variables de entorno)
En el panel de tu hosting (o en un archivo `.env` local), define:
```
WEBHOOK_SECRET=un-token-largo-y-secreto
# Telegram (lo más fácil):
TELEGRAM_BOT_TOKEN=...     (de @BotFather)
TELEGRAM_CHAT_ID=...       (de @userinfobot)
# o WhatsApp por Twilio:
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
DUENO_WHATSAPP_TO=whatsapp:+569XXXXXXXX
```
Para correr local cargando el `.env`: `node --env-file=.env server.js`

### Paso D — Conecta el número de teléfono
1. En Twilio, compra un número.
2. En Vapi → "Phone Numbers" → importa el número (SID + Auth Token de Twilio).
3. Asócialo a tu asistente.
4. **Para el cliente real:** el negocio mantiene su número y activa el **desvío de
   llamadas** hacia el número de la IA (siempre, o solo cuando no contestan).

### Paso E — Prueba de punta a punta
1. Llama al número.
2. Completa una interacción real (un pedido / una cita / una urgencia).
3. Verifica que:
   - [ ] Llega la notificación al WhatsApp/Telegram del dueño.
   - [ ] Aparece en el dashboard (`URL_BACKEND/dashboard.html`).

---

## 4. Cómo conectar las WEBS demo al backend
Cada web tiene un formulario. Por defecto solo muestra confirmación. Para que envíe
los datos al backend, abre el `script.js` de esa web y cambia:
```js
const ENVIAR_AL_BACKEND = true;                 // estaba en false
const BACKEND_URL = 'https://tu-backend.onrender.com/api/cita'; // o /api/urgencia, etc.
```
Así los formularios web también caen en tu dashboard, igual que las llamadas.

---

## 5. Probar el backend sin teléfono (rápido)
Con el servidor corriendo:
```bash
# Pedido
curl -X POST http://localhost:3000/api/pedido -H "Content-Type: application/json" \
  -d '{"cliente_nombre":"Juan","cliente_telefono":"+56911111111","tipo_entrega":"retiro","items":[{"nombre":"Pizza","cantidad":1,"precio_unitario":8990}],"total_clp":8990}'

# Cita
curl -X POST http://localhost:3000/api/cita -H "Content-Type: application/json" \
  -d '{"paciente_nombre":"Maria","paciente_telefono":"+56922222222","servicio":"Limpieza","fecha":"2026-06-10","hora":"15:30"}'

# Urgencia
curl -X POST http://localhost:3000/api/urgencia -H "Content-Type: application/json" \
  -d '{"tipo_problema":"Apertura de puerta","comuna":"Nunoa","nivel_urgencia":"Urgente","cliente_nombre":"Pedro","cliente_telefono":"+56933333333"}'
```

---

## 6. Errores comunes (y solución)

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| La IA contesta pero no llega nada al dashboard | La herramienta no tiene la Server URL correcta | Revisa que apunte a `URL_BACKEND/api/...` y que el backend esté arriba |
| Respuesta 401 "secreto inválido" | El `secret` del tool ≠ `WEBHOOK_SECRET` | Haz que coincidan exactamente |
| No llega WhatsApp/Telegram | Faltan variables de entorno | Configura `TELEGRAM_*` o `TWILIO_*` y reinicia |
| Funciona local pero no en producción | Usaste `localhost` en la Server URL | Usa la URL pública (ngrok/Render), no localhost |
| La IA "inventa" precios | El menú no está en el prompt | Asegúrate de tener el menú/servicios dentro del System Prompt |

---

## 7. Cuando crezcas (siguiente nivel)
- **Base de datos real:** cambia el archivo `pedidos.json` por Airtable o Postgres
  (solo tienes que reemplazar las funciones `leerDB()` y `guardarDB()` en `server.js`).
- **Agenda real para clínicas:** conecta `consultar_disponibilidad` y `agendar_cita`
  con Google Calendar o Cal.com.
- **Multi-cliente:** agrega un campo `negocio_id` a cada registro para atender a varios
  clientes desde el mismo backend.
- **n8n / Make:** si prefieres no tocar código, puedes reemplazar este backend por un
  flujo visual que haga lo mismo (recibir webhook → guardar → notificar).
