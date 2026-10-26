/**
 * Điểm vào chính của ứng dụng TickCore.
 * Khởi tạo MSW (nếu VITE_ENABLE_MOCK=true), i18n, rồi render App.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';
import '@/i18n';

async function enableMocking(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCK !== 'true') return;

  const { worker } = await import('@/mocks/browser');
  await worker.start({
    onUnhandledFrame: 'bypass',
    quiet: true,
  });
}

void enableMocking().then(async () => {
  const { default: App } = await import('@/app/App');
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
