import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triggerN8nWorkflow, buildInterviewScheduledPayload } from "@/lib/n8n/client";
import { rel } from "@/lib/utils";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, scheduledAt, meetingUrl, notes } = body;

    if (!applicationId || !scheduledAt) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
    }

    const { data: application } = await supabase
      .from("applications")
      .select(`
        stage,
        candidate:candidates(full_name, email),
        job:jobs(title)
      `)
      .eq("id", applicationId)
      .single();

    if (!application) {
      return NextResponse.json({ error: "Aplicación no encontrada" }, { status: 404 });
    }

    const { data: interview, error } = await supabase
      .from("interviews")
      .insert({
        application_id: applicationId,
        scheduled_at: scheduledAt,
        interviewer_id: user.id,
        meeting_url: meetingUrl || null,
        notes: notes || null,
        status: "scheduled",
      })
      .select("id, scheduled_at, meeting_url, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase
      .from("applications")
      .update({ stage: "interview", stage_changed_at: new Date().toISOString() })
      .eq("id", applicationId);

    const candidate = rel(application.candidate);
    const job = rel(application.job);

    void triggerN8nWorkflow(
      buildInterviewScheduledPayload({
        interviewId: interview.id,
        applicationId,
        candidateName: candidate?.full_name || "",
        candidateEmail: candidate?.email || "",
        jobTitle: job?.title || "",
        scheduledAt,
        meetingUrl,
      })
    );

    return NextResponse.json({ success: true, interview });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .select(`
      *,
      application:applications(
        id, stage, score,
        candidate:candidates(full_name, email),
        job:jobs(title)
      )
    `)
    .order("scheduled_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interviews: data });
}
