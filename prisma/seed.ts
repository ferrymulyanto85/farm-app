import { PrismaClient, Role, StatusLahan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("Admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@teknosolusiagro.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@teknosolusiagro.com",
      password: hashedPassword,
      role: Role.ADMIN,
      phone: "+6281234567890",
    },
  });

  console.log("Admin user created:", admin.email);

  // Create 3 lahan with corn varieties
  const lahanData = [
    {
      userId: admin.id,
      nama: "Lahan Jagung Manis - Blok A",
      lokasi: "Desa Sukamaju, Kec. Ciampea, Bogor",
      luasHektar: 2.5,
      komoditas: "Jagung Manis (Sweet Corn)",
      status: StatusLahan.AKTIF,
    },
    {
      userId: admin.id,
      nama: "Lahan Jagung Hibrida - Blok B",
      lokasi: "Desa Cibadak, Kec. Dramaga, Bogor",
      luasHektar: 3.0,
      komoditas: "Jagung Hibrida (Pioneer P21)",
      status: StatusLahan.AKTIF,
    },
    {
      userId: admin.id,
      nama: "Lahan Jagung Pipil - Blok C",
      lokasi: "Desa Ciherang, Kec. Cijeruk, Bogor",
      luasHektar: 1.8,
      komoditas: "Jagung Pipil (BISI 18)",
      status: StatusLahan.AKTIF,
    },
  ];

  for (const data of lahanData) {
    const lahan = await prisma.lahan.create({ data });
    console.log("Lahan created:", lahan.nama);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
