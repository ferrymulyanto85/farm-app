import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LahanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const lahanList = await prisma.lahan.findMany({
    where: { userId: session.user.id },
    include: {
      siklusTanam: {
        where: { status: { notIn: ["SELESAI"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { siklusTanam: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lahan Saya</h1>
          <p className="text-gray-500 mt-1">
            Kelola semua lahan pertanian Anda.
          </p>
        </div>
      </div>

      {lahanList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-300 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Belum Ada Lahan
          </h3>
          <p className="text-gray-500">
            Lahan Anda akan muncul di sini setelah didaftarkan oleh admin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lahanList.map((lahan) => {
            const siklusAktif = lahan.siklusTanam[0];
            const isAktif = lahan.status === "AKTIF";

            return (
              <div
                key={lahan.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {lahan.nama}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isAktif
                          ? "bg-hijau-100 text-hijau-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isAktif ? "AKTIF" : "TIDAK AKTIF"}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span>{lahan.lokasi || "Lokasi belum diatur"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                      <span>{Number(lahan.luasHektar)} Hektar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992" />
                      </svg>
                      <span>{lahan._count.siklusTanam} siklus tanam</span>
                    </div>
                  </div>
                  {siklusAktif && (
                    <div className="mt-3 px-3 py-2 bg-hijau-50 rounded-lg">
                      <p className="text-xs text-hijau-600 font-medium">
                        Siklus aktif: {siklusAktif.varietas} &middot;{" "}
                        {siklusAktif.status.replace("_", " ")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <Link
                    href={`/mitra/lahan/${lahan.id}`}
                    className="text-sm font-medium text-hijau-600 hover:text-hijau-700"
                  >
                    Lihat Detail &rarr;
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
