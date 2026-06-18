import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { extractTextFromPdf } from "@/lib/ai/extract-text";
import { analyzeCvWithN8n, triggerN8nWorkflow, buildCvAnalyzedPayload } from "@/lib/n8n/client";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = await createServiceClient();

    const formData = await request.formData();
    const file = formData.get("file");
    const fullName = formData.get("fullName")?.trim();
    const email = formData.get("email")?.trim();
    const phone = formData.get("phone")?.trim() || null;
    const jobId = formData.get("jobId")?.trim() || null;

    if (!file || !fullName || !email) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Solo se aceptan archivos PDF" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cvText = await extractTextFromPdf(buffer);

    if (!cvText || cvText.length < 50) {
      return NextResponse.json(
        {
          error:
            "No se pudo extraer texto del PDF. Verifica que no esté escaneado como imagen.",
        },
        { status: 422 },
      );
    }

    let jobTitle;
    let jobRequirements;

    if (jobId) {
      const { data: job } = await admin
        .from("jobs")
        .select("title, requirements")
        .eq("id", jobId)
        .single();
      jobTitle = job?.title;
      jobRequirements = job?.requirements;
    }

    const { result: aiResult, latencyMs } = await analyzeCvWithN8n({
      cvText,
      jobTitle,
      jobRequirements,
      candidateName: fullName,
    });

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const { error: uploadError } = await admin.storage
      .from("cvs")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    let cvUrl = null;
    if (!uploadError) {
      const { data: urlData } = admin.storage
        .from("cvs")
        .getPublicUrl(fileName);
      cvUrl = urlData.publicUrl;
    }

    const { data: candidate, error: candidateError } = await admin
      .from("candidates")
      .insert({
        full_name: fullName,
        email,
        phone,
        cv_url: cvUrl,
        cv_text: cvText,
        skills: aiResult.skills,
        experience_years: aiResult.classification?.experienceYears,
        seniority: aiResult.classification?.seniority,
        ai_summary: aiResult.summary,
        ai_classification: aiResult.classification,
        ai_suggestions: aiResult.suggestions,
        ai_risk_level: aiResult.riskLevel,
        created_by: user.id,
      })
      .select()
      .single();

    if (candidateError) {
      return NextResponse.json(
        { error: candidateError.message },
        { status: 500 },
      );
    }

    await admin.from("ai_audit_logs").insert({
      entity_type: "candidate",
      entity_id: candidate.id,
      model_version: "n8n-managed",
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      latency_ms: latencyMs,
      result: aiResult,
      created_by: user.id,
    });

    let application = null;
    if (jobId) {
      const score = aiResult.classification?.matchScore;
      const { data: app } = await admin
        .from("applications")
        .insert({
          job_id: jobId,
          candidate_id: candidate.id,
          stage: "screening",
          score,
          match_percentage: score,
          ai_next_step: aiResult.nextStep,
          ai_analysis: aiResult,
          stage_changed_at: new Date().toISOString(),
        })
        .select()
        .single();
      application = app;

      const { data: apps } = await admin
        .from("applications")
        .select("id, score")
        .eq("job_id", jobId)
        .order("score", { ascending: false, nullsFirst: false });

      if (apps) {
        await Promise.all(
          apps.map((app, i) =>
            admin
              .from("applications")
              .update({ ranking_position: i + 1 })
              .eq("id", app.id)
          )
        );
      }
    }

    void triggerN8nWorkflow(
      buildCvAnalyzedPayload({
        candidateId: candidate.id,
        candidateName: fullName,
        candidateEmail: email,
        jobId: jobId || undefined,
        jobTitle,
        score: aiResult.classification?.matchScore,
        seniority: aiResult.classification?.seniority,
        nextStep: aiResult.nextStep,
        summary: aiResult.summary,
      }),
    );

    return NextResponse.json({
      success: true,
      candidate,
      application,
      analysis: aiResult,
      latencyMs,
    });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 },
    );
  }
}
