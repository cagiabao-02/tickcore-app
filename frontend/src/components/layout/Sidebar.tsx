/**
 * Sidebar điều hướng cho trang admin.
 * Hiển thị menu quản trị với icon, collapse trên mobile.
 */
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Film,
  Building2,
  DoorOpen,
  Clock,
  Popcorn,
  Tag,
  Ticket,
  Users,
  MessageSquare,
  X,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  labelKey: string;
}

const navItems: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
  { to: '/admin/movies', icon: Film, labelKey: 'admin.movies' },
  { to: '/admin/cinemas', icon: Building2, labelKey: 'admin.cinemas' },
  { to: '/admin/rooms', icon: DoorOpen, labelKey: 'admin.rooms' },
  { to: '/admin/showtimes', icon: Clock, labelKey: 'admin.showtimes' },
  { to: '/admin/pricing', icon: Tag, labelKey: 'admin.pricing' },
  { to: '/admin/combos', icon: Popcorn, labelKey: 'admin.combos' },
  { to: '/admin/promotions', icon: Tag, labelKey: 'admin.promotions' },
  { to: '/admin/bookings', icon: Ticket, labelKey: 'admin.bookings' },
  { to: '/admin/users', icon: Users, labelKey: 'admin.users' },
  { to: '/admin/reviews', icon: MessageSquare, labelKey: 'admin.reviewsMgmt' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Overlay trên mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-overlay lg:hidden" onClick={onClose} />}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-card border-r border-base-primary
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label={t('admin.title')}
      >
        {/* Header sidebar */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-base-primary">
          <span className="text-lg font-bold text-base-primary">{t('admin.title')}</span>
          <button
            className="lg:hidden p-1 rounded-lg hover:bg-tertiary transition-colors text-base-secondary"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400'
                    : 'text-base-secondary hover:bg-tertiary hover:text-base-primary'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {t(item.labelKey)}
            </NavLink>
          ))}

          {/* Quay lại trang chính */}
          <div className="pt-4 mt-4 border-t border-base-primary">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-base-secondary hover:bg-tertiary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              {t('nav.home')}
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}
