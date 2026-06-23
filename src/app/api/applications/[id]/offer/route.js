import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { rel } from "@/lib/utils";
import { generateOfferPdf } from "@/lib/pdf/generate-offer";

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
    const action = body.action;

    if (!action || !["accept", "counter"].includes(action)) {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }

    const admin = await createServiceClient();

    const { data: application } = await admin
      .from("applications")
      .select("*, job:jobs(*), candidate:candidates(*)")
      .eq("id", id)
      .single();

    if (!application) {
      return NextResponse.json({ error: "Aplicación no encontrada" }, { status: 404 });
    }

    const candidate = rel(application.candidate);
    const job = rel(application.job);

    if (!candidate || candidate.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (application.stage !== "offer") {
      return NextResponse.json({ error: "La aplicación no está en etapa de oferta" }, { status: 400 });
    }

    if (application.offer_status === "accepted") {
      return NextResponse.json({ error: "La oferta ya fue aceptada" }, { status: 400 });
    }

    if (action === "accept") {
      const signedName = body.signedName?.trim();
      if (!signedName) {
        return NextResponse.json({ error: "Debes escribir tu nombre para firmar" }, { status: 400 });
      }

      const pdfBytes = await generateOfferPdf({
        candidateName: signedName,
        candidateEmail: candidate.email,
        jobTitle: job?.title || "Sin título",
        salaryOffered: application.salary_offered,
        startDate: body.startDate || null,
        companyName: "TalentAI",
      });

      const fileName = `offer-${id}-${Date.now()}.pdf`;
      const { error: uploadError } = await admin.storage
        .from("cvs")
        .upload(fileName, pdfBytes, {
          contentType: "application/pdf",
          upsert: false,
        });

      let pdfUrl = null;
      if (!uploadError) {
        const { data: urlData } = admin.storage.from("cvs").getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;
      }

      await admin
        .from("applications")
        .update({
          offer_status: "accepted",
          candidate_signed_name: signedName,
          signed_at: new Date().toISOString(),
          offer_pdf_url: pdfUrl,
          stage: "hired",
          approved_by: user.id,
          stage_changed_at: new Date().toISOString(),
        })
        .eq("id", id);

      await admin.from("stage_history").insert({
        application_id: id,
        from_stage: "offer",
        to_stage: "hired",
        changed_by: user.id,
      });

      return NextResponse.json({
        success: true,
        stage: "hired",
        pdfUrl,
        signedName,
      });
    }

    if (action === "counter") {
      const counterAmount = body.counterAmount ? Number(body.counterAmount) : null;
      const counterNotes = body.counterNotes?.trim() || null;
      const counterPosition = body.counterPosition?.trim() || null;
      const counterStartDate = body.counterStartDate?.trim() || null;

      if (!counterAmount && !counterNotes && !counterPosition && !counterStartDate) {
        return NextResponse.json({ error: "Debes ingresar al menos un cambio en tu contraoferta" }, { status: 400 });
      }

      await admin
        .from("applications")
        .update({
          offer_status: "countered",
          offer_counter_amount: counterAmount,
          offer_counter_position: counterPosition,
          offer_counter_start_date: counterStartDate,
          offer_counter_notes: counterNotes,
        })
        .eq("id", id);

      return NextResponse.json({
        success: true,
        status: "countered",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
