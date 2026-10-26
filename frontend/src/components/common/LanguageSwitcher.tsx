/**
 * Nút chuyển đổi ngôn ngữ Việt / Anh.
 * Hiển thị trên header, lưu lựa chọn vào localStorage.
 */
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/stores/languageStore';
import { Globe } from 'lucide-react';
import type { Language } from '@/types';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  /** Chuyển sang ngôn ngữ còn lại */
  const toggleLanguage = () => {
    const newLang: Language = language === 'vi' ? 'en' : 'vi';
    setLanguage(newLang);
    document.documentElement.lang = newLang;
    void i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2 py-2 rounded-lg text-base-secondary hover:bg-tertiary transition-colors text-sm font-medium"
      aria-label={t('nav.switchLanguage')}
    >
      <Globe className="h-5 w-5" />
      <span className="hidden sm:inline">{language === 'vi' ? 'VI' : 'EN'}</span>
    </button>
  );
}
