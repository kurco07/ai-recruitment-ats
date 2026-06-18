import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function PUT(request, { params }) {
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

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, email, role } = body;

    const admin = await createServiceClient();

    const updateData = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    const { error } = await admin
      .from("profiles")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    if (user.id === id) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo" },
        { status: 400 }
      );
    }

    const admin = await createServiceClient();

    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { error: authError } = await admin.auth.admin.deleteUser(id);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
