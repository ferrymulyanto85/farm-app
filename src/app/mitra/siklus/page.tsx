"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SiklusTanam } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  perencanaan: "Perencanaan",
  persiapan_lahan: "Persiapan Lahan",
  penanaman: "Penanaman",
  perawatan: "Perawatan",
  panen: "Panen",
  selesai: "Selesai",
  gagal: "Gagal",
};

const STATUS_COLORS: Record<string, string> = {
  perencanaan: "bg-gray-100 text-gray-800",
  persiapan_lahan: "bg-yellow-100 text-yellow-800",
  penanaman: "bg-blue-100 text-blue-800",
  perawatan: "bg-green-100 text-green-800",
  panen: "bg-orange-100 text-orange-800",
  selesai: "bg-emerald-100 text-emerald-800",
  gagal: "bg-red-100 text-red-800",
};

export default function SiklusListPage() {
  const [siklusList, setSiklusList] = useState<SiklusTanam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiklus();
  }, []);

  async function fetchSiklus() {
    const res = await fetch("/api/siklus");
    const data = await res.json();
    setSiklusList(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus siklus tanam ini?")) return;

    const res = await fetch(`/api/siklus/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSiklusList(siklusList.filter((s) => s.id !== id));
    }
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/siklus/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setSiklusList(
        siklusList.map((s) => (s.id === id ? { ...s, status: newStatus as SiklusTanam["status"] } : s))
      );
    }
  }

  if (loading) {
    return <p className="text-gray-500">Memuat data siklus tanam...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Siklus Tanam</h1>
        <Link
          href="/mitra/siklus/tambah"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          + Tambah Siklus
        </Link>
      </div>

      {siklusList.length === 0 ? (
        <p className="text-gray-500">Belum ada siklus tanam.</p>
      ) : (
        <div className="grid gap-4">
          {siklusList.map((siklus) => (
            <div key={siklus.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {siklus.lahan?.nama || "Lahan"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Varietas: <span className="font-medium">{siklus.varietas}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Tanam: {new Date(siklus.tanggal_tanam).toLocaleDateString("id-ID")} &mdash;
                    Est. Panen: {new Date(siklus.estimasi_panen).toLocaleDateString("id-ID")}
                  </p>
                  {siklus.catatan && (
                    <p className="text-sm text-gray-400 mt-1">Catatan: {siklus.catatan}</p>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${STATUS_COLORS[siklus.status] || "bg-gray-100"}`}>
                  {STATUS_LABELS[siklus.status] || siklus.status}
                </span>
              </div>

              <div className="mt-4 flex items-center space-x-3">
                {siklus.status !== "selesai" && siklus.status !== "gagal" && (
                  <select
                    value={siklus.status}
                    onChange={(e) => handleUpdateStatus(siklus.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="perencanaan">Perencanaan</option>
                    <option value="persiapan_lahan">Persiapan Lahan</option>
                    <option value="penanaman">Penanaman</option>
                    <option value="perawatan">Perawatan</option>
                    <option value="panen">Panen</option>
                    <option value="selesai">Selesai</option>
                    <option value="gagal">Gagal</option>
                  </select>
                )}
                <button
                  onClick={() => handleDelete(siklus.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
