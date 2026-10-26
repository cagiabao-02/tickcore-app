/**
 * Khởi tạo MSW worker cho trình duyệt.
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
