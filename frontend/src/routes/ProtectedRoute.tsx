/**
 * Route bảo vệ - chặn người chưa đăng nhập.
 * Chuyển về trang đăng nhập kèm đường dẫn quay lại (redirect).
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isInitialized, isLoading } = useAuthStore();
  const location = useLocation();

  /** Đang kiểm tra token, hiện loading */
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  /** Chưa đăng nhập, chuyển về login kèm redirect */
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}
