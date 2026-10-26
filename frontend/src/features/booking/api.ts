/**
 * API service cho đặt vé, giữ ghế, combo, mã giảm giá, thanh toán.
 */
import httpClient from '@/lib/httpClient';
import type { SeatHold, Booking, Combo, PromotionValidation, MessageResponse } from './types';

/** Giữ ghế */
export const holdSeatsApi = (showtimeId: number, seatIds: number[]) =>
  httpClient.post<SeatHold>(`/showtimes/${showtimeId}/seat-holds`, { seatIds });

/** Nhả ghế */
export const releaseHoldApi = (holdId: number) =>
  httpClient.delete<MessageResponse>(`/seat-holds/${holdId}`);

/** Danh sách combo */
export const listCombosApi = () => httpClient.get<Combo[]>('/combos');

/** Kiểm tra mã giảm giá */
export const validatePromoApi = (code: string, subtotal: number) =>
  httpClient.post<PromotionValidation>('/promotions/validate', { code, subtotal });

/** Tạo đơn đặt vé */
export const createBookingApi = (data: {
  holdId: number;
  showtimeId: number;
  combos: Array<{ comboId: number; quantity: number }>;
  promoCode: string | null;
}) => httpClient.post<Booking>('/bookings', data);
