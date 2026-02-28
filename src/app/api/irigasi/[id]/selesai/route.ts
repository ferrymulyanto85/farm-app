import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jadwal = await prisma.jadwalIrigasi.findFirst({
    where: {
      id: params.id,
      lahan: { userId: session.user.id },
      status: "DIJADWALKAN",
    },
  });

  if (!jadwal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.jadwalIrigasi.update({
    where: { id: params.id },
    data: { status: "SELESAI" },
  });

  return NextResponse.json({ success: true });
}
