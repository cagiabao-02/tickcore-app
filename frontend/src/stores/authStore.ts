/**
 * Store quản lý trạng thái xác thực người dùng.
 * Lưu thông tin user hiện tại, trạng thái đăng nhập.
 */
import { create } from 'zustand';
import type { User } from '@/types';
import { clearTokens, hasToken } from '@/lib/tokenStorage';

interface AuthState {
  /** Người dùng đang đăng nhập */
  user: User | null;
  /** Đã kiểm tra token chưa (tránh flash UI) */
  isInitialized: boolean;
  /** Đang tải thông tin user */
  isLoading: boolean;

  /** Cập nhật user sau khi đăng nhập hoặc lấy profile */
  setUser: (user: User) => void;
  /** Đăng xuất: xóa user và token */
  logout: () => void;
  /** Đánh dấu đã khởi tạo xong */
  setInitialized: (value: boolean) => void;
  /** Bật/tắt trạng thái loading */
  setLoading: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  isLoading: hasToken(),

  setUser: (user) => set({ user, isInitialized: true, isLoading: false }),
  logout: () => {
    clearTokens();
    set({ user: null, isInitialized: true, isLoading: false });
  },
  setInitialized: (value) => set({ isInitialized: value }),
  setLoading: (value) => set({ isLoading: value }),
}));
