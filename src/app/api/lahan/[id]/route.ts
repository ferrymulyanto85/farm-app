import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/lahan/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("lahan")
    .select("*, users(id, nama, email)")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Mitra can only view their own lahan
  if (session.user.role === "mitra" && data.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(data);
}

// PUT /api/lahan/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { nama, lokasi, luas_hektar, komoditas, user_id, status } = body;

  const updateData: Record<string, unknown> = {};
  if (nama !== undefined) updateData.nama = nama;
  if (lokasi !== undefined) updateData.lokasi = lokasi;
  if (luas_hektar !== undefined) updateData.luas_hektar = parseFloat(luas_hektar);
  if (komoditas !== undefined) updateData.komoditas = komoditas;
  if (user_id !== undefined) updateData.user_id = user_id;
  if (status !== undefined) updateData.status = status;

  const { data, error } = await supabaseAdmin
    .from("lahan")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/lahan/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("lahan")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Lahan berhasil dihapus" });
}
