import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MitraDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [lahanAktif, siklusBerjalan, panenBulanIni, daftarLahan, jadwalHariIni] =
    await Promise.all([
      prisma.lahan.count({
        where: { userId },
      }),
      prisma.siklusTanam.count({
        where: {
          lahan: { userId },
          status: {
            notIn: ["selesai", "gagal"],
          },
        },
      }),
      prisma.hasilPanen.count({
        where: {
          siklusTanam: { lahan: { userId } },
          tanggalPanen: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      prisma.lahan.findMany({
        where: { userId },
        include: {
          siklusTanam: {
            where: { status: { notIn: ["selesai", "gagal"] } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.jadwalIrigasi.findMany({
        where: {
          lahan: { userId },
          tanggalWaktu: {
            gte: today,
            lt: tomorrow,
          },
          status: "dijadwalkan",
        },
        include: {
          lahan: { select: { nama: true } },
        },
        orderBy: { tanggalWaktu: "asc" },
      }),
    ]);

  const summaryCards = [
    {
      title: "Lahan Aktif",
      value: lahanAktif,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
      color: "bg-hijau-50 text-hijau-700",
      href: "/mitra/lahan",
    },
    {
      title: "Siklus Berjalan",
      value: siklusBerjalan,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-700",
      href: "/mitra/siklus",
    },
    {
      title: "Panen Bulan Ini",
      value: panenBulanIni,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
      color: "bg-amber-50 text-amber-700",
      href: "/mitra/siklus",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {session.user.name}!
        </h1>
        <p className="text-gray-500 mt-1">
          Berikut ringkasan aktivitas pertanian Anda.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Daftar Lahan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Lahan</h2>
          <Link
            href="/mitra/lahan"
            className="text-sm text-hijau-600 hover:text-hijau-700 font-medium"
          >
            Lihat Semua
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {daftarLahan.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400">
              Belum ada lahan terdaftar.
            </div>
          ) : (
            daftarLahan.map((lahan) => {
              const siklusAktif = lahan.siklusTanam[0];
              return (
                <Link
                  key={lahan.id}
                  href={`/mitra/lahan/${lahan.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{lahan.nama}</p>
                    <p className="text-sm text-gray-500">
                      {lahan.lokasi || "Lokasi belum diatur"} &middot;{" "}
                      {Number(lahan.luasHektar)} ha
                    </p>
                  </div>
                  <div className="text-right">
                    {siklusAktif ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-hijau-100 text-hijau-800">
                        {siklusAktif.status.replace("_", " ")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Tidak ada siklus
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Jadwal Irigasi Hari Ini */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Jadwal Irigasi Hari Ini
          </h2>
          <Link
            href="/mitra/irigasi"
            className="text-sm text-hijau-600 hover:text-hijau-700 font-medium"
          >
            Lihat Semua
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {jadwalHariIni.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400">
              Tidak ada jadwal irigasi hari ini.
            </div>
          ) : (
            jadwalHariIni.map((jadwal) => (
              <div
                key={jadwal.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {jadwal.lahan.nama}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(jadwal.tanggalWaktu).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    &middot; {jadwal.durasiMenit} menit
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Dijadwalkan
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
