# Cómo montar todo GRATIS (y pagar solo cuando ya tienes un cliente)

La pregunta clave: ¿se puede hacer sin pagar? **Casi todo sí.** La única cosa que
siempre cuesta es **recibir llamadas telefónicas reales** (telefonía). La estrategia
ganadora es: **construye, demuestra y vende con $0**, y enciende la telefonía pagada
**solo cuando un cliente ya te está pagando** (ese costo lo cubre él).

---

## Tabla de reemplazos gratis

| Servicio pagado | Para qué | Reemplazo GRATIS |
|-----------------|----------|------------------|
| **OpenAI** | "Cerebro" del agente | **Groq** (Llama, muy rápido) o **Google Gemini** (capa gratis). También **Ollama** local. |
| **Render** (hosting) | Publicar el sistema | Webs: **Netlify / Vercel / GitHub Pages** (gratis). Backend: **Render free**, **Fly.io**, **Koyeb** (capas gratis). |
| **Twilio** (avisos) | Notificar al dueño | **Telegram** (100% gratis, ya integrado en este proyecto). |
| **Vapi** (para DEMO) | Voz del agente | **Recepcionista en el navegador** (Web Speech API): incluida en este proyecto, sin claves ni costo. |
| **Twilio** (llamadas reales) | Número que suena | No hay opción gratis real. Se activa al cerrar un cliente (lo paga el cliente). |

---

## 1. Demo de voz GRATIS (ya incluida)

Cada sitio de cliente trae un botón flotante **"🎙️ Probar recepcionista IA"**.
Funciona con la voz del navegador (Web Speech API): **habla y escucha sin costo ni
claves**. Conversa según el rubro y registra el resultado en `/dashboard`.

- Sirve para **mostrarle a un prospecto** cómo atiende la IA, en vivo, gratis.
- Funciona mejor en **Chrome/Edge**. Si el navegador no soporta voz, igual queda el
  chat escrito (también gratis).
- No reemplaza la llamada telefónica real, pero es una demo potentísima para vender.

## 2. Notificaciones GRATIS con Telegram

No necesitas Twilio para empezar. Con Telegram:
1. Crea un bot con **@BotFather** → copia el token.
2. Pide tu id a **@userinfobot**.
3. Pon `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en el `.env`.

Listo: cada pedido/cita/urgencia te llega gratis a Telegram.

## 3. Hosting GRATIS

- **Solo las webs (recomendado para vender):** sube la carpeta `public/` a
  **Netlify** (arrastrar y soltar) o **GitHub Pages**. Gratis para siempre.
  > Nota: como sitio estático puro no hay backend; los formularios usan WhatsApp y
  > la demo de voz funciona igual. Para guardar en `/dashboard` necesitas el backend.
- **Sistema completo (webs + API + panel):** despliega este proyecto en
  **Render (free)**, **Fly.io** o **Koyeb**. El plan gratis "duerme" sin tráfico;
  para un cliente real conviene el plan más barato (~USD 7/mes) que lo mantiene activo.

## 4. "Cerebro" (LLM) GRATIS — opcional, para el agente telefónico

Cuando pases a llamadas reales y quieras una IA más inteligente que la demo:
- **Groq**: API gratis, modelos Llama, muy veloz.
- **Google Gemini**: capa gratuita generosa (Gemini Flash).
- **OpenRouter**: incluye algunos modelos gratis.
Muchas plataformas de voz permiten "traer tu propio modelo" y conectar estas opciones.

## 5. Voz del agente telefónico (cuando ya cobras)

- Plataforma de voz: **Vapi** o **Retell** (tienen créditos de prueba; luego es por uso).
  Alternativas open-source para autohospedar: **Pipecat**, **Vocode**, **LiveKit Agents**.
- Telefonía/número: **Twilio** u otra (esto sí cuesta; lo paga el cliente).

---

## Plan recomendado (de $0 a facturar)

1. **Fase gratis (construir + vender):**
   - Webs en Netlify/Vercel + demo de voz del navegador + avisos por Telegram.
   - Sales a vender mostrando la demo gratis. **Inversión: $0.**
2. **Fase con cliente (cobrando):**
   - Cobras setup + mensualidad (ver `documentos-negocio/precios-y-paquetes-CLP.md`).
   - Con ese dinero activas la telefonía real (Vapi + número) para ESE cliente.
   - El costo por minuto lo incluyes en su plan, con margen.

> Conclusión: puedes lanzar la agencia **sin gastar nada**. Solo aparece un costo real
> cuando ya tienes ingresos de un cliente, y ese costo se paga solo.
