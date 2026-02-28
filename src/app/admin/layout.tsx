import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Panel - Asribuanafarm",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { name?: string; role?: string };
  const userName = user.name || "Admin";
  const userRole = user.role || "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar userName={userName} userRole={userRole} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 pl-16 lg:pl-6">
          <h1 className="text-lg font-semibold text-gray-800">
            Admin Panel
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
