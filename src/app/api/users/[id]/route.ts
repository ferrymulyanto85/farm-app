import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// GET /api/users/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, nama, email, role, no_telepon, created_at, updated_at")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/users/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { nama, email, password, no_telepon, role } = body;

  const updateData: Record<string, unknown> = {};
  if (nama !== undefined) updateData.nama = nama;
  if (email !== undefined) updateData.email = email;
  if (no_telepon !== undefined) updateData.no_telepon = no_telepon;
  if (role !== undefined) updateData.role = role;

  if (password) {
    updateData.password_hash = await bcrypt.hash(password, 12);
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updateData)
    .eq("id", params.id)
    .select("id, nama, email, role, no_telepon, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/users/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "User berhasil dihapus" });
}
