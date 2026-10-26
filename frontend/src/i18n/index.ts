/**
 * Cấu hình i18next cho đa ngôn ngữ.
 * Hỗ trợ tiếng Việt (mặc định) và tiếng Anh.
 * Đọc ngôn ngữ đã lưu từ localStorage.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi.json';
import en from './locales/en.json';

const LANG_KEY = 'tc_language';
const savedLang = typeof window !== 'undefined' ? localStorage.getItem(LANG_KEY) || 'vi' : 'vi';
if (typeof document !== 'undefined')
  document.documentElement.lang = savedLang === 'en' ? 'en' : 'vi';

void i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
