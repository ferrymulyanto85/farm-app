import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  PERSIAPAN: "Persiapan",
  TANAM: "Tanam",
  VEGETATIF: "Vegetatif",
  GENERATIF: "Generatif",
  PANEN: "Panen",
  SELESAI: "Selesai",
};

const STATUS_COLORS: Record<string, string> = {
  PERSIAPAN: "bg-gray-100 text-gray-700",
  TANAM: "bg-yellow-100 text-yellow-800",
  VEGETATIF: "bg-blue-100 text-blue-800",
  GENERATIF: "bg-hijau-100 text-hijau-800",
  PANEN: "bg-amber-100 text-amber-800",
  SELESAI: "bg-hijau-100 text-hijau-800",
};

export default async function LahanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const lahan = await prisma.lahan.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      siklusTanam: {
        orderBy: { createdAt: "desc" },
        include: {
          hasilPanen: true,
        },
      },
    },
  });

  if (!lahan) notFound();

  const siklusAktif = lahan.siklusTanam.find(
    (s) => s.status !== "SELESAI"
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/mitra/lahan" className="hover:text-hijau-600">
          Lahan Saya
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{lahan.nama}</span>
      </div>

      {/* Lahan Detail Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lahan.nama}</h1>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{lahan.lokasi || "Lokasi belum diatur"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
                <span>Luas: {Number(lahan.luasHektar)} Hektar</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span>Komoditas: {lahan.komoditas}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                lahan.status === "AKTIF"
                  ? "bg-hijau-100 text-hijau-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {lahan.status === "AKTIF" ? "AKTIF" : "TIDAK AKTIF"}
            </span>
          </div>
        </div>
      </div>

      {/* Tombol Mulai Siklus Baru */}
      {!siklusAktif && (
        <div className="bg-hijau-50 border border-hijau-200 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-medium text-hijau-900">
                Mulai Siklus Tanam Baru
              </h3>
              <p className="text-sm text-hijau-700 mt-0.5">
                Lahan ini belum memiliki siklus tanam aktif. Mulai siklus baru
                untuk mengelola penanaman.
              </p>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-hijau-600 text-white text-sm font-medium rounded-lg hover:bg-hijau-700 transition-colors whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Mulai Siklus Baru
            </button>
          </div>
        </div>
      )}

      {/* Riwayat Siklus Tanam */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Riwayat Siklus Tanam
          </h2>
        </div>
        {lahan.siklusTanam.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992" />
            </svg>
            <p>Belum ada riwayat siklus tanam.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {lahan.siklusTanam.map((siklus) => {
              const totalHasil = siklus.hasilPanen.reduce(
                (sum, h) => sum + Number(h.beratKg),
                0
              );
              return (
                <div
                  key={siklus.id}
                  className="px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {siklus.varietas}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[siklus.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {STATUS_LABELS[siklus.status] || siklus.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Tanam:{" "}
                        {new Date(siklus.tanggalTanam).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}{" "}
                        &middot; Est. Panen:{" "}
                        {new Date(siklus.tanggalPanenEstimasi).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      {siklus.status === "SELESAI" && totalHasil > 0 && (
                        <p className="text-sm font-medium text-hijau-700">
                          Hasil: {totalHasil.toLocaleString("id-ID")} kg
                        </p>
                      )}
                      {siklus.tanggalPanenAktual && (
                        <p className="text-xs text-gray-500">
                          Panen aktual:{" "}
                          {new Date(
                            siklus.tanggalPanenAktual
                          ).toLocaleDateString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
