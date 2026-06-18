import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triggerN8nWorkflow, buildStageChangedPayload } from "@/lib/n8n/client";
import { rel } from "@/lib/utils";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const stage = body.stage;
    const approveAiSuggestion = Boolean(body.approveAiSuggestion);
    const salaryOffered = body.salaryOffered || null;
    const notesText = body.notes || null;
    const rejectionReason = body.rejectionReason || null;
    const rejectionType = body.rejectionType || null;

    if (!stage) {
      return NextResponse.json({ error: "Etapa requerida" }, { status: 400 });
    }

    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select(`
        stage,
        candidate:candidates(full_name, email),
        job:jobs(title)
      `)
      .eq("id", id)
      .single();

    if (fetchError || !application) {
      return NextResponse.json({ error: "Aplicación no encontrada" }, { status: 404 });
    }

    const fromStage = application.stage;

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        stage,
        approved_by: user.id,
        stage_changed_at: new Date().toISOString(),
        salary_offered: salaryOffered,
        notes: notesText,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const candidate = rel(application.candidate);
    const job = rel(application.job);

    void triggerN8nWorkflow(
      buildStageChangedPayload({
        applicationId: id,
        candidateName: candidate?.full_name || "",
        candidateEmail: candidate?.email || "",
        jobTitle: job?.title || "",
        fromStage,
        toStage: stage,
        autoMoved: approveAiSuggestion,
      })
    );

    await supabase.from("stage_history").insert({
      application_id: id,
      from_stage: fromStage,
      to_stage: stage,
      changed_by: user.id,
      auto_moved: approveAiSuggestion,
      rejection_reason: rejectionReason,
      rejection_type: rejectionType,
    });

    return NextResponse.json({ success: true, stage });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
