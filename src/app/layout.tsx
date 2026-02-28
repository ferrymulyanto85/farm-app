import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farm App - Sistem Manajemen Pertanian",
  description: "Aplikasi manajemen pertanian jagung",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
