'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AuthUser } from '@/modules/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!data.success) {
          router.push('/login');
          return;
        }

        setUser(data.data);
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-zinc-500">로딩 중...</div>
      </div>
    );
  }

  const menuItems = [
    { name: '대시보드', path: '/dashboard', icon: '📊' },
    { name: '사용자 관리', path: '/dashboard/users', icon: '👥' },
    { name: '메뉴 관리', path: '/dashboard/menus', icon: '📋' },
    { name: '게시판 관리', path: '/dashboard/boards', icon: '📝' },
    { name: '카테고리 관리', path: '/dashboard/categories', icon: '📁' },
    { name: '공통코드 관리', path: '/dashboard/codes', icon: '🏷️' },
    { name: '알림 관리', path: '/dashboard/notifications', icon: '🔔' },
    { name: '환경설정', path: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-zinc-800 shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h1 className={`font-bold text-xl text-zinc-900 dark:text-white ${!sidebarOpen && 'hidden'}`}>
            AI Project
          </h1>
          {!sidebarOpen && <span className="text-xl">🚀</span>}
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <span>{item.icon}</span>
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user?.name} ({user?.role.name})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
