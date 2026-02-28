"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MitraDashboard() {
  const [stats, setStats] = useState({ lahan: 0, siklus: 0, aktif: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [lahanRes, siklusRes] = await Promise.all([
        fetch("/api/lahan"),
        fetch("/api/siklus"),
      ]);
      const lahan = await lahanRes.json();
      const siklus = await siklusRes.json();

      const siklusArr = Array.isArray(siklus) ? siklus : [];
      setStats({
        lahan: Array.isArray(lahan) ? lahan.length : 0,
        siklus: siklusArr.length,
        aktif: siklusArr.filter(
          (s: { status: string }) => !["selesai", "gagal"].includes(s.status)
        ).length,
      });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Mitra</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Lahan Saya</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.lahan}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Siklus</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.siklus}</p>
          <Link href="/mitra/siklus" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Lihat Siklus &rarr;
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Siklus Aktif</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.aktif}</p>
        </div>
      </div>
    </div>
  );
}
