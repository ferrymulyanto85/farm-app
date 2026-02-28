import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { IrigasiActions } from "./actions";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DIJADWALKAN: {
    label: "DIJADWALKAN",
    className: "bg-blue-100 text-blue-800",
  },
  SELESAI: {
    label: "SELESAI",
    className: "bg-hijau-100 text-hijau-800",
  },
  DIBATALKAN: {
    label: "DIBATALKAN",
    className: "bg-red-100 text-red-800",
  },
};

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("id-ID", { weekday: "long" });
}

export default async function IrigasiPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { startOfWeek, endOfWeek } = getWeekRange();

  const jadwalList = await prisma.jadwalIrigasi.findMany({
    where: {
      lahan: { userId: session.user.id },
      tanggalWaktu: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
    include: {
      lahan: { select: { nama: true } },
      siklus: { select: { varietas: true } },
    },
    orderBy: { tanggalWaktu: "asc" },
  });

  // Group by date
  const grouped: Record<
    string,
    typeof jadwalList
  > = {};
  jadwalList.forEach((jadwal) => {
    const dateKey = new Date(jadwal.tanggalWaktu).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(jadwal);
  });

  const today = new Date();
  const todayLabel = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jadwal Irigasi</h1>
        <p className="text-gray-500 mt-1">
          Jadwal irigasi minggu ini ({getDayName(startOfWeek)},{" "}
          {startOfWeek.toLocaleDateString("id-ID")} &ndash;{" "}
          {getDayName(endOfWeek)}, {endOfWeek.toLocaleDateString("id-ID")}).
        </p>
      </div>

      {jadwalList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-300 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Tidak Ada Jadwal
          </h3>
          <p className="text-gray-500">
            Belum ada jadwal irigasi untuk minggu ini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateLabel, items]) => {
            const isToday = dateLabel === todayLabel;
            return (
              <div key={dateLabel}>
                <div className="flex items-center gap-2 mb-3">
                  <h2
                    className={`text-sm font-semibold ${
                      isToday ? "text-hijau-700" : "text-gray-700"
                    }`}
                  >
                    {dateLabel}
                  </h2>
                  {isToday && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-hijau-100 text-hijau-700">
                      Hari Ini
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {items.map((jadwal) => {
                    const statusInfo =
                      STATUS_MAP[jadwal.status] || STATUS_MAP.DIJADWALKAN;
                    const waktu = new Date(
                      jadwal.tanggalWaktu
                    ).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={jadwal.id}
                        className={`bg-white rounded-xl shadow-sm border p-5 ${
                          isToday && jadwal.status === "DIJADWALKAN"
                            ? "border-hijau-200"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">
                                {jadwal.lahan.nama}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {waktu}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                                {jadwal.durasiMenit} menit
                              </span>
                              <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                                {Number(jadwal.volumeLiter)} liter
                              </span>
                              {jadwal.siklus && (
                                <span className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                  </svg>
                                  {jadwal.siklus.varietas}
                                </span>
                              )}
                            </div>
                            {jadwal.catatan && (
                              <p className="text-sm text-gray-400 italic mt-2">
                                {jadwal.catatan}
                              </p>
                            )}
                          </div>
                          {jadwal.status === "DIJADWALKAN" && (
                            <IrigasiActions jadwalId={jadwal.id} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
