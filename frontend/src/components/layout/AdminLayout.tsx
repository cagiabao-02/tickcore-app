/**
 * Layout cho trang quản trị (admin).
 * Sidebar bên trái, header nhỏ ở trên, nội dung bên phải.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin header */}
        <header className="h-16 bg-card border-b border-base-primary flex items-center justify-between px-4">
          <button
            className="lg:hidden p-2 rounded-lg text-base-secondary hover:bg-tertiary transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label={t('nav.openMenu')}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-700">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium text-base-primary">
                  {user.fullName}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
