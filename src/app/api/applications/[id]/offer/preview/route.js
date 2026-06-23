import { createClient, createServiceClient } from "@/lib/supabase/server";
import { rel } from "@/lib/utils";
import { generateOfferPdf } from "@/lib/pdf/generate-offer";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 });
    }

    const admin = await createServiceClient();
    const { data: application } = await admin
      .from("applications")
      .select("*, job:jobs(*), candidate:candidates(*)")
      .eq("id", id)
      .single();

    if (!application) {
      return new Response(JSON.stringify({ error: "Aplicación no encontrada" }), { status: 404 });
    }

    const candidate = rel(application.candidate);
    const job = rel(application.job);

    if (!candidate || candidate.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 403 });
    }

    if (application.stage !== "offer") {
      return new Response(JSON.stringify({ error: "La aplicación no está en etapa de oferta" }), { status: 400 });
    }

    const pdfBytes = await generateOfferPdf({
      candidateName: candidate.full_name || "Candidato",
      candidateEmail: candidate.email,
      jobTitle: job?.title || "Sin título",
      salaryOffered: application.offer_counter_amount || application.salary_offered,
      startDate: application.offer_counter_start_date || null,
      companyName: "TalentAI",
    });

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrato-${id}.pdf"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error interno" }),
      { status: 500 }
    );
  }
}
