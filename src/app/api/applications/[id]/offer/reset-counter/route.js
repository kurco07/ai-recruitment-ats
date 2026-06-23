import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "recruiter" && profile?.role !== "manager") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const admin = await createServiceClient();
    const { error } = await admin
      .from("applications")
      .update({
        offer_status: "pending",
        offer_counter_amount: null,
        offer_counter_position: null,
        offer_counter_start_date: null,
        offer_counter_notes: null,
        notes: "Contraoferta rechazada — se mantiene oferta original",
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: "reset" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
