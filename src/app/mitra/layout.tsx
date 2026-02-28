'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Sprout, Droplets, BarChart3, Bell } from 'lucide-react';

const navItems = [
  { href: '/mitra', label: 'Beranda', icon: Home },
  { href: '/mitra/tanam', label: 'Tanam', icon: Sprout },
  { href: '/mitra/irigasi', label: 'Irigasi', icon: Droplets },
  { href: '/mitra/laporan', label: 'Laporan', icon: BarChart3 },
];

export default function MitraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8f4ee' }}>
      {/* Header */}
      <header style={{
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#1a3a2a',
        color: '#ffffff',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <span style={{ fontWeight: 'bold', fontSize: 18 }}>🌽 TaniMitra</span>
        <Bell size={22} color="#ffffff" />
      </header>

      {/* Main scrollable content */}
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: 480,
        paddingBottom: 80,
        overflowY: 'auto',
      }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 0',
        zIndex: 50,
      }}>
        {navItems.map((item) => {
          const isActive = item.href === '/mitra'
            ? pathname === '/mitra'
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                textDecoration: 'none',
                color: isActive ? '#40916c' : '#999999',
                fontWeight: isActive ? 'bold' : 'normal',
                fontSize: 11,
              }}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
