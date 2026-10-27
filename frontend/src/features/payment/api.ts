/** Lớp API theo chức năng; giao diện gọi qua hook TanStack Query. */
import httpClient from '@/lib/httpClient';
import type { PaymentMethod, PaymentSimulation, PaymentOutcome } from './types';

/** Thanh toán mô phỏng */
export const simulatePaymentApi = (
  bookingId: number,
  method: PaymentMethod,
  outcome: PaymentOutcome,
) => httpClient.post<PaymentSimulation>('/payments/simulate', { bookingId, method, outcome });
