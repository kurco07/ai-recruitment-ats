const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL;
const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET;

function getHeaders() {
  return {
    "Content-Type": "application/json",
    ...(N8N_SECRET ? { "X-Webhook-Secret": N8N_SECRET } : {}),
  };
}

export async function triggerN8nWorkflow(payload) {
  if (!N8N_BASE_URL) {
    console.warn("[n8n] N8N_WEBHOOK_URL no configurada — evento omitido:", payload.event);
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch(N8N_BASE_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[n8n] Error:", response.status, text);
      return { ok: false, error: text };
    }

    return { ok: true };
  } catch (error) {
    console.error("[n8n] Fallo de conexión:", error);
    return { ok: false, error: String(error) };
  }
}

export async function analyzeCvWithN8n({ cvText, jobTitle, jobRequirements, candidateName }) {
  const analysisUrl = process.env.N8N_ANALYSIS_URL || N8N_BASE_URL;

  if (!analysisUrl) {
    throw new Error("N8N_WEBHOOK_URL no configurada — no se puede analizar CV");
  }

  const startTime = Date.now();

  const response = await fetch(analysisUrl, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      event: "cv_analyze",
      timestamp: new Date().toISOString(),
      data: { cvText, jobTitle, jobRequirements, candidateName },
    }),
    signal: AbortSignal.timeout(60000),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`n8n analysis failed (${response.status}): ${text}`);
  }

  const result = await response.json();

  return { result, latencyMs };
}

export function buildCvAnalyzedPayload(data) {
  return {
    event: "cv_analyzed",
    timestamp: new Date().toISOString(),
    data,
  };
}

export function buildStageChangedPayload(data) {
  return {
    event: "stage_changed",
    timestamp: new Date().toISOString(),
    data,
  };
}

export function buildInterviewScheduledPayload(data) {
  return {
    event: "interview_scheduled",
    timestamp: new Date().toISOString(),
    data,
  };
}
