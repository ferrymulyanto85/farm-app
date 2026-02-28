import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getLahanData() {
  const lahanList = await prisma.lahan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { nama: true } },
      siklusTanam: {
        where: {
          status: { notIn: ["selesai", "gagal"] },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          varietas: true,
          status: true,
        },
      },
    },
  });

  return lahanList;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  perencanaan: { label: "Perencanaan", color: "bg-gray-100 text-gray-700" },
  persiapan_lahan: { label: "Persiapan Lahan", color: "bg-yellow-100 text-yellow-700" },
  penanaman: { label: "Penanaman", color: "bg-blue-100 text-blue-700" },
  perawatan: { label: "Perawatan", color: "bg-cyan-100 text-cyan-700" },
  panen: { label: "Panen", color: "bg-green-100 text-green-700" },
};

export default async function AdminLahanPage() {
  const lahanList = await getLahanData();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Daftar Lahan</h2>
        <Link
          href="/admin/lahan/tambah"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Lahan
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Nama Lahan</th>
                <th className="px-6 py-3">Mitra</th>
                <th className="px-6 py-3">Komoditas</th>
                <th className="px-6 py-3">Luas (Ha)</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lahanList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data lahan.
                  </td>
                </tr>
              ) : (
                lahanList.map((lahan) => {
                  const activeSiklus = lahan.siklusTanam[0];
                  const statusInfo = activeSiklus
                    ? statusLabels[activeSiklus.status] || {
                        label: activeSiklus.status,
                        color: "bg-gray-100 text-gray-700",
                      }
                    : { label: "Tidak Aktif", color: "bg-gray-100 text-gray-500" };

                  return (
                    <tr key={lahan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {lahan.nama}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {lahan.user.nama}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {activeSiklus ? activeSiklus.varietas : "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {Number(lahan.luasHektar).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/lahan/${lahan.id}`}
                          className="font-medium text-brand-600 hover:text-brand-700"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
