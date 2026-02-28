import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// GET /api/users - List users
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, nama, email, role, no_telepon, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/users - Create user
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { nama, email, password, no_telepon, role } = body;

  if (!nama || !email || !password) {
    return NextResponse.json(
      { error: "Nama, email, dan password wajib diisi" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 400 }
    );
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      nama,
      email,
      password_hash,
      no_telepon: no_telepon || null,
      role: role || "mitra",
    })
    .select("id, nama, email, role, no_telepon, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
