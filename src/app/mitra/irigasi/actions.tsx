"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function IrigasiActions({ jadwalId }: { jadwalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleKonfirmasi() {
    setLoading(true);
    try {
      const res = await fetch(`/api/irigasi/${jadwalId}/selesai`, {
        method: "PATCH",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleKonfirmasi}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 bg-hijau-600 text-white text-sm font-medium rounded-lg hover:bg-hijau-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
      Konfirmasi Selesai
    </button>
  );
}
