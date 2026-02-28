"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ lahan: 0, users: 0, siklus: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [lahanRes, usersRes, siklusRes] = await Promise.all([
        fetch("/api/lahan"),
        fetch("/api/users"),
        fetch("/api/siklus"),
      ]);
      const lahan = await lahanRes.json();
      const users = await usersRes.json();
      const siklus = await siklusRes.json();
      setStats({
        lahan: Array.isArray(lahan) ? lahan.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        siklus: Array.isArray(siklus) ? siklus.length : 0,
      });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Lahan</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.lahan}</p>
          <Link href="/admin/lahan" className="text-sm text-green-600 hover:underline mt-2 inline-block">
            Kelola Lahan &rarr;
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.users}</p>
          <Link href="/admin/users" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Kelola Users &rarr;
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Siklus Tanam</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.siklus}</p>
        </div>
      </div>
    </div>
  );
}
