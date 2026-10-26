/**
 * Layout chính cho trang khách hàng.
 * Bao gồm Header, nội dung chính (Outlet), và Footer.
 */
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BookingLeaveGuard from '@/features/booking/components/BookingLeaveGuard';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <Header />
      <BookingLeaveGuard />
      <ScrollRestoration />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
