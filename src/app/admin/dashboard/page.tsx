import { prisma } from "@/lib/prisma";
import StatsCard from "@/components/admin/StatsCard";

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [totalLahan, totalMitra, panenBulanIni, siklusTerbaru] =
    await Promise.all([
      prisma.lahan.count(),
      prisma.user.count({ where: { role: "mitra" } }),
      prisma.hasilPanen.findMany({
        where: {
          tanggalPanen: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          totalPendapatan: true,
        },
      }),
      prisma.siklusTanam.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          lahan: {
            include: {
              user: { select: { nama: true } },
            },
          },
        },
      }),
    ]);

  const totalPendapatan = panenBulanIni.reduce(
    (sum, p) => sum + Number(p.totalPendapatan || 0),
    0
  );

  return {
    totalLahan,
    totalMitra,
    panenCount: panenBulanIni.length,
    totalPendapatan,
    siklusTerbaru,
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

const statusLabels: Record<string, { label: string; color: string }> = {
  perencanaan: { label: "Perencanaan", color: "bg-gray-100 text-gray-700" },
  persiapan_lahan: { label: "Persiapan Lahan", color: "bg-yellow-100 text-yellow-700" },
  penanaman: { label: "Penanaman", color: "bg-blue-100 text-blue-700" },
  perawatan: { label: "Perawatan", color: "bg-cyan-100 text-cyan-700" },
  panen: { label: "Panen", color: "bg-green-100 text-green-700" },
  selesai: { label: "Selesai", color: "bg-brand-100 text-brand-700" },
  gagal: { label: "Gagal", color: "bg-red-100 text-red-700" },
};

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Lahan"
          value={data.totalLahan}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          }
          description="Total lahan terdaftar"
        />
        <StatsCard
          title="Total Mitra"
          value={data.totalMitra}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
          description="Mitra aktif"
        />
        <StatsCard
          title="Panen Bulan Ini"
          value={data.panenCount}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          }
          description="Hasil panen bulan ini"
        />
        <StatsCard
          title="Pendapatan Bulan Ini"
          value={formatCurrency(data.totalPendapatan)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
          description="Total pendapatan"
        />
      </div>

      {/* Recent Siklus Tanam Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Siklus Tanam Terbaru
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Lahan</th>
                <th className="px-6 py-3">Mitra</th>
                <th className="px-6 py-3">Varietas</th>
                <th className="px-6 py-3">Tanggal Tanam</th>
                <th className="px-6 py-3">Estimasi Panen</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.siklusTerbaru.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data siklus tanam.
                  </td>
                </tr>
              ) : (
                data.siklusTerbaru.map((siklus) => {
                  const statusInfo = statusLabels[siklus.status] || {
                    label: siklus.status,
                    color: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr key={siklus.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {siklus.lahan.nama}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {siklus.lahan.user.nama}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {siklus.varietas}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(siklus.tanggalTanam)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(siklus.estimasiPanen)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
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
