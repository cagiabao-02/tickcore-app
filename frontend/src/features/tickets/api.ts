/** Lớp API theo chức năng; giao diện gọi qua hook TanStack Query. */
import httpClient from '@/lib/httpClient';
import type { Booking, Page } from './types';

/** Vé của tôi */
export const getMyBookingsApi = (params: { status?: string; page?: number; size?: number }) =>
  httpClient.get<Page<Booking>>('/bookings/me', { params });

/** Chi tiết đặt vé */
export const getBookingDetailApi = (id: number) => httpClient.get<Booking>(`/bookings/${id}`);

/** Hủy vé */
export const cancelBookingApi = (id: number) => httpClient.post<Booking>(`/bookings/${id}/cancel`);
