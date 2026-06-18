# Guia de Configuracion n8n — TalentAI ATS

Esta guia explica como configurar los workflows de n8n que el sistema necesita para funcionar.

---

## Requisitos previos

1. **Cuenta n8n** — Puede ser n8n Cloud (https://n8n.io) o una instancia self-hosted
2. **API key de Groq** — https://console.groq.com/keys (gratis)
3. **Servidor de email** — Gmail, SMTP, o el servicio que prefieras para enviar emails

---

## Variables de entorno

### En n8n (Settings → Variables)

| Variable | Descripcion | Valor |
|----------|-------------|-------|
| `GROQ_API_KEY` | API key de Groq para analisis de CVs | `gsk_tu_api_key_aqui` |

### En .env.local del proyecto

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `N8N_ANALYSIS_URL` | URL del webhook de analisis IA | `https://tu-n8n.com/webhook/talentai-analyze` |
| `N8N_WEBHOOK_URL` | URL del webhook de notificaciones | `https://tu-n8n.com/webhook/talentai-ats` |
| `N8N_WEBHOOK_SECRET` | Secreto compartido (opcional) | `mi-secreto-compartido` |

> **Importante:** Si usas n8n Cloud, las URLs son `https://tu-instancia.app.n8n.cloud/webhook/...`
> Si usas self-hosted, seran `https://tu-dominio.com/webhook/...`

---

## Workflow 1: Analisis de CV con IA

Este es el workflow mas importante. Recibe el texto del CV, lo analiza con Groq, y devuelve el resultado.

### Crear workflow

1. En n8n, haz click en **"New Workflow"**
2. Nombre: `TalentAI - Analisis de CV`

### Nodo 1: Webhook (Trigger)

1. Busca **"Webhook"** en el panel de nodos
2. Configura:
   - **Method:** POST
   - **Path:** `talentai-analyze`
   - **Response Mode:** `Last Node` (IMPORTANTE: para devolver el resultado)
3. Copia la URL del webhook — la necesitaras en `.env.local`

### Nodo 2: HTTP Request (Groq API)

1. Busca **"HTTP Request"**
2. Conecta despues del Webhook
3. Configura:
   - **Method:** POST
   - **URL:** `https://api.groq.com/openai/v1/chat/completions`
   - **Send Headers:** ON
   - **Header Parameters:**
     - Name: `Authorization`
     - Value: `Bearer {{ $env.GROQ_API_KEY }}`
   - **Send Body:** ON
   - **Body Content Type:** JSON
   - **Body (usar Raw JSON):**

```json
{
  "model": "llama-3.3-70b-versatile",
  "temperature": 0.2,
  "messages": [
    {
      "role": "system",
      "content": "Eres un experto en reclutamiento tecnico. Extrae skills, detecta seniority, calcula adecuacion y sugiere el siguiente paso del proceso. Responde unicamente JSON valido sin texto adicional."
    },
    {
      "role": "user",
      "content": "Analiza este CV para la vacante: {{ $json.data.jobTitle || 'Sin vacante especifica' }}\n\nRequisitos: {{ $json.data.jobRequirements || 'No especificados' }}\n\nNombre del candidato: {{ $json.data.candidateName }}\n\nTexto del CV:\n{{ $json.data.cvText }}"
    }
  ]
}
```

### Nodo 3: Code (Parsear respuesta)

1. Busca **"Code"** (o "Function")
2. Conecta despues del HTTP Request
3. Pega este codigo:

```javascript
const response = $input.first().json;
const content = response.choices[0].message.content;

// Limpiar markdown code blocks si existen
const cleaned = content
  .replace(/```json\n?/g, "")
  .replace(/```\n?/g, "")
  .trim();

try {
  const parsed = JSON.parse(cleaned);
  return [{ json: parsed }];
} catch (error) {
  // Si el parse falla, devolver el contenido crudo para debug
  return [{ json: { error: "JSON parse failed", raw: cleaned } }];
}
```

### Nodo 4: Respond to Webhook

1. Busca **"Respond to Webhook"**
2. Conecta despues del Code
3. Configura:
   - **Response Code:** 200
   - **Response Body:** `{{ $json }}` (o selecciona "First Entry JSON")

### Activar el workflow

1. Haz click en **"Active"** (toggle arriba a la derecha)
2. El webhook ya esta listo para recibir requests

### Probar el workflow

```bash
curl -X POST https://tu-n8n.com/webhook/talentai-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "event": "cv_analyze",
    "timestamp": "2026-06-16T00:00:00Z",
    "data": {
      "cvText": "Pedro Gonzalez, 5 anos de experiencia en React y Node.js. Trabajo en MercadoLibre como Frontend Developer. Skills: React, TypeScript, Next.js, PostgreSQL.",
      "jobTitle": "Desarrollador Full Stack",
      "jobRequirements": "3+ anos de experiencia, React, Node.js, bases de datos",
      "candidateName": "Pedro Gonzalez"
    }
  }'
```

**Respuesta esperada:**
```json
{
  "summary": "Desarrollador Frontend con 5 anos de experiencia en React y Node.js...",
  "classification": {
    "seniority": "mid",
    "fitLevel": "alto",
    "primarySkills": ["React", "Node.js", "TypeScript"],
    "experienceYears": 5,
    "matchScore": 82
  },
  "suggestions": ["Entrevista tecnica para evaluar conocimientos avanzados"],
  "riskLevel": "low",
  "nextStep": "entrevista",
  "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "Next.js"]
}
```

---

## Workflow 2: Notificaciones

Este workflow recibe eventos y envia emails. No bloquea la respuesta de la app.

### Crear workflow

1. En n8n, haz click en **"New Workflow"**
2. Nombre: `TalentAI - Notificaciones`

### Nodo 1: Webhook (Trigger)

1. Busca **"Webhook"**
2. Configura:
   - **Method:** POST
   - **Path:** `talentai-ats`
   - **Response Mode:** `Immediately` (IMPORTANTE: la app no espera)
3. Copia la URL del webhook

### Nodo 2: Switch (Routing por evento)

1. Busca **"Switch"**
2. Conecta despues del Webhook
3. Configura:
   - **Routing Rules:**
     - Route 1: `{{ $json.event }}` equals `cv_analyzed`
     - Route 2: `{{ $json.event }}` equals `stage_changed`
     - Route 3: `{{ $json.event }}` equals `interview_scheduled`

### Ruta 1: Email de bienvenida (cv_analyzed)

1. Conecta un nodo **"Send Email"** (Gmail, SMTP, etc.) despues de la Route 1
2. Configura:
   - **To:** `{{ $json.data.candidateEmail }}`
   - **Subject:** `Tu CV ha sido recibido - {{ $json.data.jobTitle }}`
   - **Body:**
```
Hola {{ $json.data.candidateName }},

Tu CV para la posicion "{{ $json.data.jobTitle }}" ha sido recibido exitosamente.

Nuestro sistema de IA esta analizando tu perfil. Recibiras una notificacion cuando el proceso avance.

Score de adecuacion: {{ $json.data.score }}/100
Seniority detectado: {{ $json.data.seniority }}

Saludos,
Equipo de TalentAI
```

### Ruta 2: Email de cambio de etapa (stage_changed)

1. Conecta otro **"Send Email"** despues de la Route 2
2. Configura:
   - **To:** `{{ $json.data.candidateEmail }}`
   - **Subject:** `Actualizacion de tu proceso - {{ $json.data.jobTitle }}`
   - **Body:**
```
Hola {{ $json.data.candidateName }},

Tu postulacion para "{{ $json.data.jobTitle }}" ha avanzado.

Etapa anterior: {{ $json.data.fromStage }}
Nueva etapa: {{ $json.data.toStage }}

Sigue atento a proximas notificaciones.

Saludos,
Equipo de TalentAI
```

### Ruta 3: Email de entrevista (interview_scheduled)

1. Conecta otro **"Send Email"** despues de la Route 3
2. Configura:
   - **To:** `{{ $json.data.candidateEmail }}`
   - **Subject:** `Entrevista agendada - {{ $json.data.jobTitle }}`
   - **Body:**
```
Hola {{ $json.data.candidateName }},

Se ha agendado una entrevista para la posicion "{{ $json.data.jobTitle }}".

Fecha y hora: {{ $json.data.scheduledAt }}
{{ $json.data.meetingUrl ? "Link de reunion: " + $json.data.meetingUrl : "" }}

Por favor confirma tu asistencia.

Saludos,
Equipo de TalentAI
```

### Activar el workflow

1. Haz click en **"Active"**

### Probar el workflow

```bash
# Test cv_analyzed
curl -X POST https://tu-n8n.com/webhook/talentai-ats \
  -H "Content-Type: application/json" \
  -d '{
    "event": "cv_analyzed",
    "timestamp": "2026-06-16T00:00:00Z",
    "data": {
      "candidateId": "abc123",
      "candidateName": "Pedro Gonzalez",
      "candidateEmail": "pedro@gmail.com",
      "jobTitle": "Desarrollador Full Stack",
      "score": 82,
      "seniority": "mid",
      "nextStep": "entrevista",
      "summary": "Perfil con 5 anos de experiencia"
    }
  }'

# Test stage_changed
curl -X POST https://tu-n8n.com/webhook/talentai-ats \
  -H "Content-Type: application/json" \
  -d '{
    "event": "stage_changed",
    "timestamp": "2026-06-16T00:00:00Z",
    "data": {
      "applicationId": "app123",
      "candidateName": "Pedro Gonzalez",
      "candidateEmail": "pedro@gmail.com",
      "jobTitle": "Desarrollador Full Stack",
      "fromStage": "screening",
      "toStage": "interview",
      "autoMoved": false
    }
  }'

# Test interview_scheduled
curl -X POST https://tu-n8n.com/webhook/talentai-ats \
  -H "Content-Type: application/json" \
  -d '{
    "event": "interview_scheduled",
    "timestamp": "2026-06-16T00:00:00Z",
    "data": {
      "interviewId": "int456",
      "applicationId": "app123",
      "candidateName": "Pedro Gonzalez",
      "candidateEmail": "pedro@gmail.com",
      "jobTitle": "Desarrollador Full Stack",
      "scheduledAt": "2026-06-20T10:00:00Z",
      "meetingUrl": "https://meet.google.com/abc-defg-hij"
    }
  }'
```

---

## Estructura de respuesta del Workflow 1

El Workflow 1 (Analisis) debe devolver un JSON con esta estructura exacta:

```json
{
  "summary": "Resumen profesional en 2-3 oraciones",
  "classification": {
    "seniority": "junior|mid|senior|lead",
    "fitLevel": "bajo|medio|alto|excelente",
    "primarySkills": ["skill1", "skill2"],
    "experienceYears": 0,
    "matchScore": 0
  },
  "suggestions": ["sugerencia1", "sugerencia2"],
  "riskLevel": "low|medium|high",
  "nextStep": "entrevista|prueba_tecnica|descarte|screening",
  "skills": ["skill1", "skill2"]
}
```

> **Nota:** El `matchScore` es un numero del 0 al 100. El `nextStep` determina la sugerencia de etapa en la app.

---

## Troubleshooting

### Error 401 en Groq
- **Causa:** API key invalida o expirada
- **Solucion:** Verificar `GROQ_API_KEY` en Variables de n8n

### Timeout en analisis
- **Causa:** Groq tardo mas de 60 segundos
- **Solucion:** Verificar la conexion de n8n a internet. Reintentar.

### Webhook no responde
- **Causa:** Workflow no esta activo o path incorrecto
- **Solucion:** Verificar que el workflow este en "Active". Verificar el path.

### Email no se envia
- **Causa:** Credential de email no configurada en n8n
- **Solucion:** Ir a Credentials → agregar tu servicio de email (Gmail, SMTP, etc.)

### JSON parse error en Workflow 1
- **Causa:** Groq devolvio texto que no es JSON valido
- **Solucion:** El nodo Code tiene un fallback que devuelve el contenido crudo. Revisar los logs de n8n.

### La app no recibe resultado del analisis
- **Causa:** `N8N_ANALYSIS_URL` apunta al webhook incorrecto
- **Solucion:** Verificar la URL en `.local`. Asegurarse de que termine en `/webhook/talentai-analyze`

---

## Resumen de arquitectura

```
[Usuario sube CV]
    │
    ▼
[Next.js API] ──extractText──► [pdf2json]
    │
    ▼
[analyzeCvWithN8n] ──POST──► [n8n Workflow 1: talentai-analyze]
    │                              │
    │                              ▼
    │                         [Groq API]
    │                              │
    │◄──────── respuesta ─────────┘
    │
    ▼
[Guardar en BD] ──void trigger──► [n8n Workflow 2: talentai-ats]
                                        │
                                        ▼
                                   [Send Email]
```

### Flujo de datos

1. **Upload:** El usuario sube un CV
2. **Extraccion:** pdf2json extrae el texto del PDF
3. **Analisis:** Next.js envia el texto a n8n (sincronico, espera respuesta)
4. **n8n:** Recibe el texto, llama a Groq, parsea la respuesta, la devuelve
5. **Guardado:** Next.js guarda los resultados en la BD
6. **Notificacion:** Next.js dispara un webhook fire-and-forget a n8n
7. **Email:** n8n envia el email correspondiente

---

## URLs de referencia

| Workflow | Path del webhook | Env var |
|----------|-----------------|---------|
| Analisis IA | `/webhook/talentai-analyze` | `N8N_ANALYSIS_URL` |
| Notificaciones | `/webhook/talentai-ats` | `N8N_WEBHOOK_URL` |
