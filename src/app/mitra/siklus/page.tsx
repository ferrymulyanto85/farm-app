import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUS_STEPS = [
  "PERSIAPAN",
  "TANAM",
  "VEGETATIF",
  "GENERATIF",
  "PANEN",
  "SELESAI",
] as const;

const STATUS_LABELS: Record<string, string> = {
  PERSIAPAN: "Persiapan",
  TANAM: "Tanam",
  VEGETATIF: "Vegetatif",
  GENERATIF: "Generatif",
  PANEN: "Panen",
  SELESAI: "Selesai",
};

function getProgressPercentage(status: string): number {
  const idx = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / STATUS_STEPS.length) * 100);
}

function getProgressColor(status: string): string {
  if (status === "SELESAI") return "bg-hijau-600";
  return "bg-hijau-500";
}

export default async function SiklusTanamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const siklusList = await prisma.siklusTanam.findMany({
    where: {
      lahan: { userId: session.user.id },
      status: { notIn: ["SELESAI"] },
    },
    include: {
      lahan: { select: { nama: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Siklus Tanam</h1>
        <p className="text-gray-500 mt-1">
          Pantau semua siklus tanam aktif di lahan Anda.
        </p>
      </div>

      {siklusList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-300 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Tidak Ada Siklus Aktif
          </h3>
          <p className="text-gray-500 mb-4">
            Belum ada siklus tanam yang berjalan saat ini.
          </p>
          <Link
            href="/mitra/lahan"
            className="inline-flex items-center px-4 py-2 bg-hijau-600 text-white text-sm font-medium rounded-lg hover:bg-hijau-700 transition-colors"
          >
            Lihat Lahan Saya
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {siklusList.map((siklus) => {
            const progress = getProgressPercentage(siklus.status);
            const progressColor = getProgressColor(siklus.status);
            const currentStepIdx = STATUS_STEPS.indexOf(
              siklus.status as (typeof STATUS_STEPS)[number]
            );

            return (
              <div
                key={siklus.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {siklus.lahan.nama}
                      </h3>
                      <span className="text-sm text-gray-500">
                        &middot; {siklus.varietas}
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-hijau-100 text-hijau-800 whitespace-nowrap">
                    {STATUS_LABELS[siklus.status] || siklus.status}
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-500">
                      Progress
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center justify-between mt-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div
                        key={step}
                        className="flex flex-col items-center flex-1"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCurrent
                              ? "bg-hijau-600 text-white ring-2 ring-hijau-200"
                              : isCompleted
                              ? "bg-hijau-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={`text-[10px] mt-1 text-center leading-tight hidden sm:block ${
                            isCurrent
                              ? "text-hijau-700 font-semibold"
                              : "text-gray-400"
                          }`}
                        >
                          {STATUS_LABELS[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50">
                  <Link
                    href={`/mitra/lahan/${siklus.lahanId}`}
                    className="text-sm font-medium text-hijau-600 hover:text-hijau-700"
                  >
                    Lihat Detail Lahan &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
