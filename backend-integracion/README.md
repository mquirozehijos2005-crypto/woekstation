# Backend de Integración — NexVoz

Recibe los pedidos desde el agente de voz IA, los guarda y notifica al dueño
del negocio por **WhatsApp (Twilio)** o **Telegram**. Incluye un panel web
para ver los pedidos en vivo.

**Sin dependencias externas** → no necesitas `npm install`.

---

## 1. Arrancar en local

```bash
node server.js
```

Verás:
```
🚀 Backend NexVoz corriendo en http://localhost:3000
   Dashboard:      http://localhost:3000/dashboard.html
```

Abre el **dashboard** en el navegador para ver los pedidos.

## 2. Probar sin teléfono (simular un pedido)

Con el servidor corriendo, en otra terminal:

```bash
curl -X POST http://localhost:3000/api/pedido \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Camila Rojas",
    "cliente_telefono": "+56 9 1234 5678",
    "tipo_entrega": "delivery",
    "direccion": "Av. Siempre Viva 123, depto 4B",
    "items": [
      { "nombre": "Pizza Pepperoni", "cantidad": 1, "precio_unitario": 10990 },
      { "nombre": "Bebida 1.5L", "cantidad": 1, "precio_unitario": 2990 }
    ],
    "total_clp": 13980,
    "forma_pago": "efectivo"
  }'
```

El pedido aparecerá en el dashboard y se imprimirá la notificación en la consola
(o llegará a WhatsApp/Telegram si lo configuraste).

## 3. Configurar notificaciones reales

Copia `.env.example` a `.env` y completa los valores. Para cargar el `.env`
sin librerías, arranca así:

```bash
node --env-file=.env server.js
```

> Node 20+ soporta `--env-file` de forma nativa. Si usas Node 18, exporta las
> variables manualmente o usa el paquete `dotenv`.

**Telegram (lo más rápido):**
1. Crea un bot con [@BotFather](https://t.me/BotFather) y copia el token.
2. Obtén tu `chat_id` (escríbele a [@userinfobot](https://t.me/userinfobot)).
3. Pon ambos valores en `.env`.

**WhatsApp (Twilio):** completa las variables `TWILIO_*` y `DUENO_WHATSAPP_TO`.

## 4. Conectar con Vapi

En la herramienta `registrar_pedido` de tu asistente, pon como **Server URL**:
```
https://TU-DOMINIO/api/pedido
```
Y el mismo `WEBHOOK_SECRET` en el campo "secret".

Para exponer tu localhost mientras pruebas:
```bash
npx ngrok http 3000
```

## 5. Desplegar gratis (producción)

- **Render** o **Railway**: conecta tu repo, comando de inicio `node server.js`,
  agrega las variables de entorno en el panel. Listo.
- Asegúrate de que el plan permita almacenamiento persistente o migra `pedidos.json`
  a una base de datos real (ver abajo).

---

## Endpoints

| Método | Ruta | Para qué |
|--------|------|----------|
| POST | `/api/pedido` | Registrar un pedido (lo llama Vapi) |
| POST | `/api/lead` | Registrar un lead desde la web |
| POST | `/api/vapi-webhook` | Eventos generales de Vapi |
| GET | `/api/pedidos` | Listar pedidos y leads (JSON) |
| GET | `/api/health` | Estado del servicio |
| GET | `/dashboard.html` | Panel visual de pedidos |

## Próximo paso: base de datos real

Para producción con varios clientes, reemplaza el archivo `pedidos.json` por:
- **Airtable** (visual, fácil para el dueño) o
- **Postgres / Supabase** (escalable).

La lógica de guardado está aislada en las funciones `leerDB()` y `guardarDB()`,
así que solo tienes que cambiar esas dos.
