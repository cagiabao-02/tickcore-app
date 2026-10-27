/**
 * Bảng route cho toàn bộ ứng dụng.
 * Sử dụng lazy-load cho từng trang để tối ưu bundle size.
 */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

/** Fallback loading khi lazy-load trang */
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
    </div>
  );
}

/** Wrapper lazy-load */
function LazyPage({
  component: Component,
}: {
  component: React.LazyExoticComponent<React.ComponentType>;
}) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>
  );
}

// ===== LAZY IMPORTS: Trang khách =====
const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const MoviesPage = lazy(() => import('@/features/movies/pages/MoviesPage'));
const MovieDetailPage = lazy(() => import('@/features/movies/pages/MovieDetailPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const SeatSelectionPage = lazy(() => import('@/features/booking/pages/SeatSelectionPage'));
const CombosPage = lazy(() => import('@/features/booking/pages/CombosPage'));
const CheckoutPage = lazy(() => import('@/features/booking/pages/CheckoutPage'));
const BookingResultPage = lazy(() => import('@/features/booking/pages/BookingResultPage'));
const TicketsPage = lazy(() => import('@/features/tickets/pages/TicketsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/features/errors/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/features/errors/ForbiddenPage'));

// ===== LAZY IMPORTS: Trang admin =====
const DashboardPage = lazy(() => import('@/features/admin/pages/DashboardPage'));
const AdminMoviesPage = lazy(() => import('@/features/admin/pages/AdminMoviesPage'));
const AdminCinemasPage = lazy(() => import('@/features/admin/pages/AdminCinemasPage'));
const AdminRoomsPage = lazy(() => import('@/features/admin/pages/AdminRoomsPage'));
const AdminShowtimesPage = lazy(() => import('@/features/admin/pages/AdminShowtimesPage'));
const AdminCombosPage = lazy(() => import('@/features/admin/pages/AdminCombosPage'));
const AdminPromotionsPage = lazy(() => import('@/features/admin/pages/AdminPromotionsPage'));
const AdminBookingsPage = lazy(() => import('@/features/admin/pages/AdminBookingsPage'));
const AdminTicketScanPage = lazy(() => import('@/features/admin/pages/AdminTicketScanPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage'));
const AdminReviewsPage = lazy(() => import('@/features/admin/pages/AdminReviewsPage'));
const AdminPricingPage = lazy(() => import('@/features/admin/pages/AdminPricingPage'));

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      // === Trang công khai ===
      { path: '/', element: <LazyPage component={HomePage} /> },
      { path: '/movies', element: <LazyPage component={MoviesPage} /> },
      { path: '/movies/:id', element: <LazyPage component={MovieDetailPage} /> },
      { path: '/login', element: <LazyPage component={LoginPage} /> },
      { path: '/register', element: <LazyPage component={RegisterPage} /> },
      { path: '/forgot-password', element: <LazyPage component={ForgotPasswordPage} /> },
      { path: '/reset-password', element: <LazyPage component={ResetPasswordPage} /> },

      // === Trang cần đăng nhập (USER) ===
      {
        path: '/booking/:showtimeId/seats',
        element: (
          <ProtectedRoute>
            <LazyPage component={SeatSelectionPage} />
          </ProtectedRoute>
        ),
      },
      {
        path: '/booking/:showtimeId/combos',
        element: (
          <ProtectedRoute>
            <LazyPage component={CombosPage} />
          </ProtectedRoute>
        ),
      },
      {
        path: '/booking/:showtimeId/checkout',
        element: (
          <ProtectedRoute>
            <LazyPage component={CheckoutPage} />
          </ProtectedRoute>
        ),
      },
      {
        path: '/booking/result/:bookingId',
        element: (
          <ProtectedRoute>
            <LazyPage component={BookingResultPage} />
          </ProtectedRoute>
        ),
      },
      {
        path: '/tickets',
        element: (
          <ProtectedRoute>
            <LazyPage component={TicketsPage} />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <LazyPage component={ProfilePage} />
          </ProtectedRoute>
        ),
      },

      // === Trang lỗi ===
      { path: '/403', element: <LazyPage component={ForbiddenPage} /> },
      { path: '*', element: <LazyPage component={NotFoundPage} /> },
    ],
  },

  // === Trang admin (layout riêng) ===
  {
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { path: '/admin', element: <LazyPage component={DashboardPage} /> },
      { path: '/admin/movies', element: <LazyPage component={AdminMoviesPage} /> },
      { path: '/admin/cinemas', element: <LazyPage component={AdminCinemasPage} /> },
      { path: '/admin/rooms', element: <LazyPage component={AdminRoomsPage} /> },
      { path: '/admin/showtimes', element: <LazyPage component={AdminShowtimesPage} /> },
      { path: '/admin/combos', element: <LazyPage component={AdminCombosPage} /> },
      { path: '/admin/promotions', element: <LazyPage component={AdminPromotionsPage} /> },
      { path: '/admin/bookings', element: <LazyPage component={AdminBookingsPage} /> },
      { path: '/admin/ticket-scan', element: <LazyPage component={AdminTicketScanPage} /> },
      { path: '/admin/users', element: <LazyPage component={AdminUsersPage} /> },
      { path: '/admin/reviews', element: <LazyPage component={AdminReviewsPage} /> },
      { path: '/admin/pricing', element: <LazyPage component={AdminPricingPage} /> },
    ],
  },
]);
