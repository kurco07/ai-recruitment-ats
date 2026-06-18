import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title: body.title,
      description: body.description || "",
      requirements: body.requirements || "",
      department: body.department || null,
      seniority_level: body.seniority_level || null,
      status: body.status || "draft",
      recruiter_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ job: data });
}

export async function GET(request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ jobs: data });
}
