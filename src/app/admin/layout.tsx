"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard" className="text-xl font-bold text-green-600">
                Farm App
              </Link>
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-green-600">
                Dashboard
              </Link>
              <Link href="/admin/lahan" className="text-gray-700 hover:text-green-600">
                Lahan
              </Link>
              <Link href="/admin/users" className="text-gray-700 hover:text-green-600">
                Users
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {session.user.name} (Admin)
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
