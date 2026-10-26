/**
 * Header chính của ứng dụng.
 * Chứa logo, menu điều hướng, nút đăng nhập/đăng ký hoặc thông tin user,
 * nút chuyển ngôn ngữ và giao diện sáng/tối.
 * Responsive: menu hamburger trên mobile.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '@/stores/bookingStore';
import { logoutApi } from '@/features/auth/api';
import { releaseBookingSession } from '@/features/booking/lib/bookingSession';
import Modal from '@/components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { Film, Menu, X, Ticket, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import Button from '@/components/ui/Button';

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const queryClient = useQueryClient();
  const signOut = useMutation({
    mutationFn: async () => {
      await releaseBookingSession();
      await logoutApi();
    },
    onSettled: () => {
      useBookingStore.getState().reset();
      queryClient.clear();
      logout();
      setUserMenuOpen(false);
      setConfirmLogout(false);
      navigate('/login');
    },
  });

  const handleLogout = () => {
    if (useBookingStore.getState().holdId) setConfirmLogout(true);
    else signOut.mutate();
  };

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-base-primary">
      <Modal isOpen={confirmLogout} onClose={() => setConfirmLogout(false)} title={t('nav.logout')}>
        <p>{t('booking.holdConfirmLeave')}</p>
        <Button isLoading={signOut.isPending} onClick={() => signOut.mutate()}>
          {t('common.confirm')}
        </Button>
      </Modal>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-primary-600 rounded-lg group-hover:bg-primary-700 transition-colors">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-base-primary">
              Tick<span className="text-primary-600">Core</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label={t('nav.mainNavigation')}>
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-base-secondary hover:text-base-primary hover:bg-tertiary transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/movies"
              className="px-3 py-2 rounded-lg text-sm font-medium text-base-secondary hover:text-base-primary hover:bg-tertiary transition-colors"
            >
              {t('nav.movies')}
            </Link>
            {user && (
              <Link
                to="/tickets"
                className="px-3 py-2 rounded-lg text-sm font-medium text-base-secondary hover:text-base-primary hover:bg-tertiary transition-colors"
              >
                {t('nav.myTickets')}
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-base-secondary hover:bg-tertiary transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-700">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline">{user.fullName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-base-primary shadow-theme-lg z-50 py-1 animate-slide-down">
                      <div className="px-4 py-2 border-b border-base-primary">
                        <p className="text-sm font-medium text-base-primary">{user.fullName}</p>
                        <p className="text-xs text-base-tertiary">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-base-secondary hover:bg-tertiary transition-colors"
                      >
                        <User className="h-4 w-4" />
                        {t('nav.profile')}
                      </Link>
                      <Link
                        to="/tickets"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-base-secondary hover:bg-tertiary transition-colors"
                      >
                        <Ticket className="h-4 w-4" />
                        {t('nav.myTickets')}
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-600 hover:bg-tertiary transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                          {t('nav.admin')}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-error-500 hover:bg-tertiary transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  {t('nav.login')}
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  {t('nav.register')}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-base-secondary hover:bg-tertiary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('nav.openMenu')}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav
            className="md:hidden py-4 border-t border-base-primary animate-slide-down"
            aria-label={t('nav.mobileNavigation')}
          >
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-base-secondary hover:bg-tertiary"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/movies"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-base-secondary hover:bg-tertiary"
              >
                {t('nav.movies')}
              </Link>
              {user ? (
                <>
                  <Link
                    to="/tickets"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-base-secondary hover:bg-tertiary"
                  >
                    {t('nav.myTickets')}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-base-secondary hover:bg-tertiary"
                  >
                    {t('nav.profile')}
                  </Link>
                </>
              ) : (
                <div className="flex gap-2 mt-2 px-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    {t('nav.login')}
                  </Button>
                  <Button
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                  >
                    {t('nav.register')}
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
