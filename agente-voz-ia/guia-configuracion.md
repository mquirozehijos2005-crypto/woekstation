# Guía de Configuración del Agente de Voz IA

Esta guía te lleva paso a paso para tener tu recepcionista IA contestando llamadas reales.
Usaremos **Vapi** (recomendado) + **Twilio** para la telefonía. El proceso con Retell AI es muy similar.

---

## Resumen del flujo técnico

```
Cliente llama → Número Twilio → Vapi (agente de voz) → registra el pedido
                                      │
                                      └── llama a tu BACKEND (/api/pedido)
                                                  │
                                          guarda + avisa al dueño por WhatsApp
```

---

## Paso 1 — Crea tus cuentas

1. **Vapi** → https://vapi.ai (te dan minutos gratis para probar).
2. **Twilio** → https://twilio.com (para comprar un número de teléfono).
3. **OpenAI** → para la "inteligencia" (modelo gpt-4o). Vapi también ofrece modelos propios.
4. **ElevenLabs** (opcional) → para una voz más natural en español.

> Guarda todas las API keys en un lugar seguro. NUNCA las escribas dentro del código.

## Paso 2 — Crea el asistente en Vapi

**Opción A — Desde el dashboard (más fácil):**
1. Entra a Vapi → "Assistants" → "Create Assistant".
2. En **System Prompt**, pega el bloque que está en `prompt-sistema.md`.
3. En **First Message**, pega el primer mensaje sugerido.
4. **Model:** OpenAI · gpt-4o · temperature 0.5.
5. **Transcriber:** Deepgram · nova-2 · idioma `es`.
6. **Voice:** elige una voz en español (ElevenLabs o las de Vapi). Prueba varias.

**Opción B — Vía API (usando vapi-config.json):**
```bash
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer TU_API_KEY_DE_VAPI" \
  -H "Content-Type: application/json" \
  -d @vapi-config.json
```

## Paso 3 — Agrega las herramientas (tools / functions)

En el asistente, sección **Tools / Functions**, crea:

1. **`registrar_pedido`** (función personalizada)
   - Usa el esquema de parámetros del `vapi-config.json`.
   - **Server URL:** la URL pública de tu backend + `/api/pedido`
     (ej: `https://mi-backend.onrender.com/api/pedido`).

2. **`transferir_a_humano`** (transfer call)
   - Destino: el número de WhatsApp/teléfono del dueño.

> Para tener una URL pública mientras desarrollas en tu PC, usa **ngrok**:
> `ngrok http 3000` → te da una URL tipo `https://abc123.ngrok.io` que apunta a tu backend local.

## Paso 4 — Conecta el número de teléfono (Twilio)

1. En Twilio, compra un número (de Chile o uno internacional para empezar).
2. En Vapi → "Phone Numbers" → importa tu número de Twilio (pega el SID y Auth Token).
3. Asocia ese número a tu asistente.
4. ¡Listo! Llama al número y habla con tu IA.

> **Para clientes reales:** el negocio mantiene su número actual y configura el
> **desvío de llamadas** hacia el número de la IA (siempre, o solo cuando no contestan).

## Paso 5 — Prueba de punta a punta

1. Levanta el servidor (`npm start`) y exponlo con ngrok.
2. Llama al número.
3. Haz un pedido completo.
4. Verifica que:
   - El pedido aparece en el panel (`/dashboard`).
   - Llega la notificación al dueño (WhatsApp/Telegram).

---

## Costos aproximados (para que calcules tu margen)

| Componente | Costo aprox. |
|------------|--------------|
| Vapi (orquestación) | ~USD 0,05 / min |
| Transcripción (Deepgram) | incluido / bajo |
| Modelo (gpt-4o) | ~USD 0,01–0,03 / min |
| Voz (ElevenLabs) | ~USD 0,01–0,05 / min |
| Número Twilio | ~USD 1–2 / mes + uso |
| **Total estimado** | **~USD 0,08–0,15 / min** |

En CLP eso es aprox. **$80 – $150 por minuto** de costo. Tú lo cobras a tu cliente
con margen (ej. $250–$350/min) o dentro de una bolsa mensual de minutos.

---

## Checklist de calidad antes de entregar a un cliente

- [ ] La voz suena natural y en buen español chileno.
- [ ] El menú/precios están correctos y actualizados.
- [ ] La IA confirma SIEMPRE el pedido antes de registrarlo.
- [ ] La transferencia a humano funciona.
- [ ] El pedido llega al backend y al WhatsApp del dueño.
- [ ] Probaste casos raros: cliente indeciso, fuera de horario, mala señal.
