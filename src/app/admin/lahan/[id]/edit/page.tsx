"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { User } from "@/types";

export default function EditLahanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [mitraList, setMitraList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    luas_hektar: "",
    komoditas: "",
    user_id: "",
    status: "aktif",
  });

  useEffect(() => {
    async function fetchData() {
      const [lahanRes, usersRes] = await Promise.all([
        fetch(`/api/lahan/${id}`),
        fetch("/api/users"),
      ]);

      if (lahanRes.ok) {
        const lahan = await lahanRes.json();
        setForm({
          nama: lahan.nama || "",
          lokasi: lahan.lokasi || "",
          luas_hektar: String(lahan.luas_hektar || ""),
          komoditas: lahan.komoditas || "",
          user_id: lahan.user_id || "",
          status: lahan.status || "aktif",
        });
      }

      const users = await usersRes.json();
      if (Array.isArray(users)) {
        setMitraList(users.filter((u: User) => u.role === "mitra"));
      }

      setFetching(false);
    }
    fetchData();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/lahan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin/lahan");
    } else {
      const data = await res.json();
      setError(data.error || "Gagal mengupdate lahan");
    }
    setLoading(false);
  }

  if (fetching) {
    return <p className="text-gray-500">Memuat data lahan...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Lahan</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lahan *</label>
          <input
            type="text"
            required
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
          <input
            type="text"
            value={form.lokasi}
            onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Luas (Hektar) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={form.luas_hektar}
            onChange={(e) => setForm({ ...form, luas_hektar: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Komoditas</label>
          <input
            type="text"
            value={form.komoditas}
            onChange={(e) => setForm({ ...form, komoditas: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mitra *</label>
          <select
            required
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Pilih Mitra</option>
            {mitraList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} ({m.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="aktif">Aktif</option>
            <option value="tidak_aktif">Tidak Aktif</option>
          </select>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Update"}
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
