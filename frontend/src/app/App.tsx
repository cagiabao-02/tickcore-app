/**
 * Component gốc của ứng dụng.
 * Bọc các provider: QueryClient, Toast, Router.
 * Khởi tạo auth state khi app load.
 */
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { router } from '@/routes';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { hasToken } from '@/lib/tokenStorage';
import { getMeApi } from '@/features/auth/api';

/**
 * Component khởi tạo auth - tự động lấy profile nếu có token.
 * Phải nằm trong QueryClientProvider.
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setInitialized, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (!hasToken()) {
        setInitialized(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getMeApi();
        setUser(response.data);
      } catch {
        setInitialized(true);
        setLoading(false);
      }
    };

    void initAuth();
  }, [setUser, setInitialized, setLoading]);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </ToastProvider>
    </QueryClientProvider>
  );
}
