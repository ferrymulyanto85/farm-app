import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/siklus - List siklus tanam
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabaseAdmin
    .from("siklus_tanam")
    .select("*, lahan(id, nama, lokasi, user_id, users(id, nama))")
    .order("created_at", { ascending: false });

  // Mitra can only see siklus for their own lahan
  if (session.user.role === "mitra") {
    query = query.eq("lahan.user_id", session.user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter out entries where lahan is null (due to inner join filter for mitra)
  const filtered = session.user.role === "mitra"
    ? data?.filter((s) => s.lahan !== null)
    : data;

  return NextResponse.json(filtered);
}

// POST /api/siklus - Create siklus tanam
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { lahan_id, varietas, tanggal_tanam, estimasi_panen, catatan } = body;

  if (!lahan_id || !varietas || !tanggal_tanam || !estimasi_panen) {
    return NextResponse.json(
      { error: "Lahan, varietas, tanggal tanam, dan estimasi panen wajib diisi" },
      { status: 400 }
    );
  }

  // If mitra, verify they own the lahan
  if (session.user.role === "mitra") {
    const { data: lahan } = await supabaseAdmin
      .from("lahan")
      .select("user_id")
      .eq("id", lahan_id)
      .single();

    if (!lahan || lahan.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke lahan ini" },
        { status: 403 }
      );
    }
  }

  const { data, error } = await supabaseAdmin
    .from("siklus_tanam")
    .insert({
      lahan_id,
      varietas,
      tanggal_tanam,
      estimasi_panen,
      catatan: catatan || null,
      status: "perencanaan",
    })
    .select("*, lahan(id, nama)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
