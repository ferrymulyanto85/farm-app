"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Lahan, VarietasJagung } from "@/types";

const VARIETAS_OPTIONS: VarietasJagung[] = ["NK212", "Bisi-18", "Pioneer P27"];

export default function TambahSiklusPage() {
  const router = useRouter();
  const [lahanList, setLahanList] = useState<Lahan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    lahan_id: "",
    varietas: "NK212" as VarietasJagung,
    tanggal_tanam: "",
    estimasi_panen: "",
    catatan: "",
  });

  useEffect(() => {
    async function fetchLahan() {
      const res = await fetch("/api/lahan");
      const data = await res.json();
      setLahanList(Array.isArray(data) ? data : []);
    }
    fetchLahan();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.lahan_id || !form.varietas || !form.tanggal_tanam || !form.estimasi_panen) {
      setError("Lahan, varietas, tanggal tanam, dan estimasi panen wajib diisi");
      setLoading(false);
      return;
    }

    if (new Date(form.estimasi_panen) <= new Date(form.tanggal_tanam)) {
      setError("Estimasi panen harus setelah tanggal tanam");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/siklus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/mitra/siklus");
    } else {
      const data = await res.json();
      setError(data.error || "Gagal menambah siklus tanam");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Siklus Tanam</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Lahan *</label>
          <select
            required
            value={form.lahan_id}
            onChange={(e) => setForm({ ...form, lahan_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Pilih Lahan</option>
            {lahanList.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nama} - {l.lokasi || "Tanpa lokasi"} ({l.luas_hektar} Ha)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Varietas *</label>
          <select
            required
            value={form.varietas}
            onChange={(e) => setForm({ ...form, varietas: e.target.value as VarietasJagung })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            {VARIETAS_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Tanam *</label>
          <input
            type="date"
            required
            value={form.tanggal_tanam}
            onChange={(e) => setForm({ ...form, tanggal_tanam: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Panen *</label>
          <input
            type="date"
            required
            value={form.estimasi_panen}
            onChange={(e) => setForm({ ...form, estimasi_panen: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea
            value={form.catatan}
            onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Catatan tambahan (opsional)"
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
