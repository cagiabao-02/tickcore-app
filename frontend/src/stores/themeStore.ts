/**
 * Store quản lý chế độ giao diện sáng/tối.
 * Ba chế độ: light, dark, system. Lưu vào localStorage.
 * Áp dụng class "dark" vào <html> trước khi render để tránh nháy màu.
 */
import { create } from 'zustand';
import type { ThemeMode } from '@/types';

const THEME_KEY = 'tc_theme';

/** Lấy theme hệ thống */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Áp dụng class dark/light vào document */
function applyTheme(mode: ThemeMode): void {
  const resolved = mode === 'system' ? getSystemTheme() : mode;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/** Đọc theme đã lưu */
function getSavedTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const mode = localStorage.getItem(THEME_KEY);
  return mode === 'light' || mode === 'dark' ? mode : 'system';
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

// Áp dụng theme ngay khi module load (trước render)
const initialMode = getSavedTheme();
applyTheme(initialMode);

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initialMode,
  setMode: (mode) => {
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
    set({ mode });
  },
}));

// Lắng nghe thay đổi theme hệ thống
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const currentMode = useThemeStore.getState().mode;
    if (currentMode === 'system') {
      applyTheme('system');
    }
  });
}
