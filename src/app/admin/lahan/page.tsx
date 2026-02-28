"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lahan } from "@/types";

export default function LahanListPage() {
  const [lahanList, setLahanList] = useState<Lahan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLahan();
  }, []);

  async function fetchLahan() {
    const res = await fetch("/api/lahan");
    const data = await res.json();
    setLahanList(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus lahan ini?")) return;

    const res = await fetch(`/api/lahan/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLahanList(lahanList.filter((l) => l.id !== id));
    }
  }

  if (loading) {
    return <p className="text-gray-500">Memuat data lahan...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Lahan</h1>
        <Link
          href="/admin/lahan/tambah"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          + Tambah Lahan
        </Link>
      </div>

      {lahanList.length === 0 ? (
        <p className="text-gray-500">Belum ada data lahan.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luas (Ha)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komoditas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mitra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lahanList.map((lahan) => (
                <tr key={lahan.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lahan.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lahan.lokasi || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lahan.luas_hektar}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lahan.komoditas || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lahan.users?.nama || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lahan.status === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {lahan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link
                      href={`/admin/lahan/${lahan.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(lahan.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
