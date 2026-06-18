# Workflows n8n — TalentAI ATS

La app envía eventos POST a `N8N_WEBHOOK_URL` con este formato:

```json
{
  "event": "cv_analyzed | stage_changed | interview_scheduled",
  "timestamp": "2026-06-11T12:00:00.000Z",
  "data": { ... }
}
```

## Workflow 1: Email al analizar CV

**Trigger:** Webhook (POST)  
**Filtro:** `{{ $json.event === 'cv_analyzed' }}`

**Nodos sugeridos:**
1. Webhook
2. IF — event = cv_analyzed
3. Gmail / Send Email
   - To: `{{ $json.data.candidateEmail }}`
   - Subject: `CV recibido — {{ $json.data.jobTitle }}`
   - Body: Resumen IA + score + seniority

## Workflow 2: Email al cambiar etapa

**Trigger:** Webhook  
**Filtro:** `{{ $json.event === 'stage_changed' }}`

**Email al candidato:**
- Subject: `Actualización de tu proceso — {{ $json.data.jobTitle }}`
- Body: Etapa anterior → nueva etapa

**Opcional — mover etapa automática:**
- IF score > 80 AND nextStep = entrevista → actualizar etapa vía API (requiere aprobación humana en app)

## Workflow 3: Agendar entrevista

**Trigger:** Webhook  
**Filtro:** `{{ $json.event === 'interview_scheduled' }}`

**Nodos:**
1. Send Email con fecha, URL reunión
2. Google Calendar — crear evento
3. Slack — notificar al recruiter

## Workflow 4: Resumen diario (opcional)

**Trigger:** Cron 9:00 AM  
**Nodos:**
1. HTTP Request → GET métricas de Supabase
2. Send Email al equipo de talento

## Seguridad

Header opcional: `X-Webhook-Secret: tu-secreto`  
Configura el mismo valor en `.env.local` como `N8N_WEBHOOK_SECRET`.

## Optimización de tokens (Baremo #11)

1. Truncar CV a 12K caracteres antes de IA
2. Usar `gpt-4o-mini` para volumen
3. `response_format: json_object` reduce tokens de salida
4. No re-analizar CVs idénticos (cache por hash)
5. Batch de notificaciones en n8n en lugar de IA por email
