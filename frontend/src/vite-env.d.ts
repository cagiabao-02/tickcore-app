/// <reference types="vite/client" />

/** Kiểu các biến môi trường Vite dùng bởi frontend. */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_MOCK?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
