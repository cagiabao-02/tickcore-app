/**
 * Store quản lý ngôn ngữ hiển thị.
 * Hỗ trợ tiếng Việt (vi) và tiếng Anh (en), mặc định tiếng Việt.
 * Lưu lựa chọn vào localStorage.
 */
import { create } from 'zustand';
import type { Language } from '@/types';

const LANG_KEY = 'tc_language';

/** Đọc ngôn ngữ đã lưu */
function getSavedLanguage(): Language {
  if (typeof window === 'undefined') return 'vi';
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'vi';
}

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getSavedLanguage(),
  setLanguage: (lang) => {
    localStorage.setItem(LANG_KEY, lang);
    set({ language: lang });
  },
}));
