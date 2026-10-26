/**
 * Nút chuyển đổi giao diện sáng/tối/hệ thống.
 * Hiển thị trên header, lưu lựa chọn vào localStorage.
 */
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useTranslation } from 'react-i18next';
import type { ThemeMode } from '@/types';

const themeIcons: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const themeOrder: ThemeMode[] = ['light', 'dark', 'system'];

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { mode, setMode } = useThemeStore();
  const Icon = themeIcons[mode];

  /** Chuyển sang chế độ tiếp theo */
  const cycleTheme = () => {
    const currentIdx = themeOrder.indexOf(mode);
    const nextIdx = (currentIdx + 1) % themeOrder.length;
    setMode(themeOrder[nextIdx]);
  };

  const labelKey = mode === 'light' ? 'themeLight' : mode === 'dark' ? 'themeDark' : 'themeSystem';

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 p-2 rounded-lg text-base-secondary hover:bg-tertiary transition-colors"
      aria-label={t(`nav.${labelKey}`)}
      title={t(`nav.${labelKey}`)}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
