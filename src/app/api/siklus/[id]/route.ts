import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/siklus/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("siklus_tanam")
    .select("*, lahan(id, nama, lokasi, user_id)")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Mitra can only view their own siklus
  if (session.user.role === "mitra" && data.lahan?.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(data);
}

// PUT /api/siklus/[id] - Update siklus (including status)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership for mitra
  if (session.user.role === "mitra") {
    const { data: existing } = await supabaseAdmin
      .from("siklus_tanam")
      .select("lahan(user_id)")
      .eq("id", params.id)
      .single();

    const lahan = existing?.lahan as unknown as { user_id: string } | null;
    if (!existing || lahan?.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await request.json();
  const { varietas, tanggal_tanam, estimasi_panen, status, catatan, tanggal_panen_aktual } = body;

  const updateData: Record<string, unknown> = {};
  if (varietas !== undefined) updateData.varietas = varietas;
  if (tanggal_tanam !== undefined) updateData.tanggal_tanam = tanggal_tanam;
  if (estimasi_panen !== undefined) updateData.estimasi_panen = estimasi_panen;
  if (status !== undefined) updateData.status = status;
  if (catatan !== undefined) updateData.catatan = catatan;
  if (tanggal_panen_aktual !== undefined) updateData.tanggal_panen_aktual = tanggal_panen_aktual;

  const { data, error } = await supabaseAdmin
    .from("siklus_tanam")
    .update(updateData)
    .eq("id", params.id)
    .select("*, lahan(id, nama)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/siklus/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership for mitra
  if (session.user.role === "mitra") {
    const { data: existing } = await supabaseAdmin
      .from("siklus_tanam")
      .select("lahan(user_id)")
      .eq("id", params.id)
      .single();

    const lahan = existing?.lahan as unknown as { user_id: string } | null;
    if (!existing || lahan?.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { error } = await supabaseAdmin
    .from("siklus_tanam")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Siklus tanam berhasil dihapus" });
}
