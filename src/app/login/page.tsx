"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [activeTab, setActiveTab] = useState<"admin" | "mitra">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mitra form state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("admin-login", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handleMitraLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("otp-login", {
      phone,
      otp,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/mitra");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Asribuanafarm</h1>
        <p className="text-gray-500 mt-1">PT. Tekno Solusi Agro</p>
        <p className="text-sm text-gray-400 mt-1">Farm Management System</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => {
            setActiveTab("admin");
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "admin"
              ? "bg-white text-green-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Admin / Supervisor
        </button>
        <button
          onClick={() => {
            setActiveTab("mitra");
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "mitra"
              ? "bg-white text-green-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Mitra
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Admin Login Form */}
      {activeTab === "admin" && (
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@teknosolusiagro.com"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      )}

      {/* Mitra OTP Login Form */}
      {activeTab === "mitra" && (
        <form onSubmit={handleMitraLogin} className="space-y-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nomor Telepon
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+6281234567890"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kode OTP
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Masukkan 6 digit OTP"
              maxLength={6}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memverifikasi..." : "Masuk dengan OTP"}
          </button>
        </form>
      )}

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-gray-400">
        &copy; 2026 PT. Tekno Solusi Agro. All rights reserved.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg text-center text-gray-400">
            Memuat...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
