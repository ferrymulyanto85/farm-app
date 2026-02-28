import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/lahan - List all lahan
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  let query = supabaseAdmin
    .from("lahan")
    .select("*, users(id, nama, email)")
    .order("created_at", { ascending: false });

  // If mitra, only show their own lahan
  if (session.user.role === "mitra") {
    query = query.eq("user_id", session.user.id);
  } else if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/lahan - Create new lahan
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { nama, lokasi, luas_hektar, komoditas, user_id, status } = body;

  if (!nama || !luas_hektar || !user_id) {
    return NextResponse.json(
      { error: "Nama, luas hektar, dan mitra wajib diisi" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("lahan")
    .insert({
      nama,
      lokasi: lokasi || null,
      luas_hektar: parseFloat(luas_hektar),
      komoditas: komoditas || null,
      user_id,
      status: status || "aktif",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
