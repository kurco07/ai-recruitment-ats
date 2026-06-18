# TalentAI ATS — Proyecto 2 (AI Recruitment Platform)

Plataforma ATS completa para analizar CVs, rankear candidatos y automatizar reclutamiento con IA y n8n.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 + Tailwind CSS |
| Backend/Auth | Supabase |
| Base de datos | PostgreSQL (Supabase) |
| IA | OpenAI API (JSON estructurado) |
| Automatización | n8n (webhooks) |
| Deploy | Vercel |

## Rutas de la aplicación

### Públicas
- `/` — Landing
- `/login` — Iniciar sesión
- `/register` — Registro con selección de rol

### Recruiter (`/recruiter/*`)
- `/recruiter/dashboard` — Métricas generales
- `/recruiter/jobs` — Listado de vacantes
- `/recruiter/jobs/new` — Crear vacante
- `/recruiter/jobs/[id]` — Detalle + ranking IA
- `/recruiter/candidates` — Dashboard candidatos
- `/recruiter/candidates/upload` — Subir CV PDF
- `/recruiter/candidates/[id]` — Perfil + análisis IA
- `/recruiter/pipeline` — Kanban de etapas
- `/recruiter/interviews` — Agendar entrevistas
- `/recruiter/metrics` — Métricas por vacante
- `/recruiter/ai-audit` — Tokens y observabilidad IA

### Candidato (`/candidate/*`)
- `/candidate/dashboard` — Mis aplicaciones
- `/candidate/jobs` — Vacantes abiertas
- `/candidate/jobs/[id]` — Detalle + postular con CV

### Hiring Manager (`/manager/*`)
- `/manager/dashboard` — Vista ejecutiva
- `/manager/compare` — Score comparativo
- `/manager/metrics` — Redirige a métricas

### Admin (`/admin/*`)
- `/admin/users` — Gestión de roles

## Setup local

```bash
cd ai-recruitment-ats
npm install
cp .env.local.example .env.local
# Configura Supabase + OpenAI + n8n
npm run dev
```

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta `supabase/migrations/001_initial_schema.sql` en el SQL Editor
3. Crea bucket de storage `cvs` (privado o público según prefieras)
4. Copia URL y keys a `.env.local`

### 2. OpenAI

Configura `OPENAI_API_KEY` para análisis de CVs.

### 3. n8n

Ver `docs/N8N_WORKFLOWS.md` para configurar:
- Email al analizar CV
- Email al cambiar etapa
- Email al agendar entrevista

## Integración IA (estándar Proyecto 2)

- **Entrada estructurada:** CV normalizado + contexto de vacante
- **Salida JSON:** `summary`, `classification`, `suggestions`, `riskLevel`, `nextStep`
- **Human-in-the-loop:** mover etapas requiere confirmación manual
- **Observabilidad:** tabla `ai_audit_logs` con tokens y latencia
- **n8n:** cada evento clave dispara webhook

## User stories cubiertas

1. ✅ Subir CVs PDF con evaluación automática
2. ✅ Ranking por vacante
3. ✅ Detección de seniority
4. ✅ Resumen de perfil
5. ✅ Score comparativo (Hiring Manager)
6. ✅ Mover candidatos de etapa (con n8n)
7. ✅ Confirmaciones por correo (vía n8n)
8. ✅ Métricas por vacante

## Baremo de evaluación

| Criterio | Implementación |
|----------|----------------|
| Objetivo | ATS con IA para reclutamiento |
| Herramientas | Next.js, Supabase, OpenAI, n8n |
| Trigger | Upload CV / cambio etapa / entrevista |
| Automatización | Webhooks n8n |
| IA integrada | Análisis CV con JSON |
| Output útil | Ranking, resúmenes, emails |
| Errores | PDF vacío, auth, validaciones |
| Requisitos | Todas las user stories |
| Tokens | Página `/recruiter/ai-audit` |
| Optimización | Sugerencias en ai-audit |
| Documentación | Este README + N8N_WORKFLOWS |
