/** Thu hồi đơn chờ/hold khi rời luồng; lấy hold mới khi quay lại sửa đơn chưa thanh toán. */
import { useBookingStore } from '@/stores/bookingStore';
import { cancelBookingApi } from '@/features/tickets/api';
import { holdSeatsApi, releaseHoldApi } from '../api';

export async function releaseBookingSession(): Promise<void> {
  const state = useBookingStore.getState();
  if (state.pendingBookingId) await cancelBookingApi(state.pendingBookingId);
  else if (state.holdId) await releaseHoldApi(state.holdId);
  useBookingStore.getState().clearHold();
}

/** Đơn đã tạo phải được hủy trước khi sửa combo/giá; ghế được kiểm tra lại khi lấy hold mới. */
export async function ensureEditableHold(): Promise<void> {
  if (useBookingStore.getState().pendingBookingId) await releaseBookingSession();
  const state = useBookingStore.getState();
  if (!state.holdId && state.showtimeId && state.selectedSeats.length) {
    const response = await holdSeatsApi(
      state.showtimeId,
      state.selectedSeats.map((seat) => seat.id),
    );
    state.setHold(response.data.holdId, response.data.expiresAt);
  }
}
