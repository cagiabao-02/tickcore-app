/**
 * Store quản lý giỏ đặt vé trong quá trình booking.
 * Lưu thông tin suất chiếu, ghế đã chọn, combo, mã giảm giá, holdId.
 */
import { create } from 'zustand';
import type { Seat, Combo, ShowFormat } from '@/types';

interface BookingComboItem {
  combo: Combo;
  quantity: number;
}

interface BookingState {
  /** ID suất chiếu đang đặt */
  showtimeId: number | null;
  /** Thông tin hiển thị */
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  showDate: string;
  showTime: string;
  format: ShowFormat | null;

  /** Ghế đã chọn */
  selectedSeats: Seat[];
  /** Combo đã chọn */
  selectedCombos: BookingComboItem[];
  /** Mã giảm giá */
  promoCode: string | null;
  discountAmount: number;

  /** ID giữ ghế và thời hạn */
  holdId: number | null;
  holdExpiresAt: string | null;
  pendingBookingId: number | null;

  /** Các action */
  setShowtime: (data: {
    showtimeId: number;
    movieTitle: string;
    cinemaName: string;
    roomName: string;
    showDate: string;
    showTime: string;
    format: ShowFormat;
  }) => void;
  setSelectedSeats: (seats: Seat[]) => void;
  toggleSeat: (seat: Seat) => void;
  setSelectedCombos: (combos: BookingComboItem[]) => void;
  updateComboQuantity: (comboId: number, quantity: number) => void;
  setPromoCode: (code: string | null, discount: number) => void;
  setHold: (holdId: number, expiresAt: string) => void;
  clearHold: () => void;
  setPendingBookingId: (id: number) => void;
  reset: () => void;

  /** Tính tổng tiền ghế */
  getSeatsTotal: () => number;
  /** Tính tổng tiền combo */
  getCombosTotal: () => number;
  /** Tính tổng tiền sau giảm giá */
  getGrandTotal: () => number;
}

const initialState = {
  showtimeId: null,
  movieTitle: '',
  cinemaName: '',
  roomName: '',
  showDate: '',
  showTime: '',
  format: null,
  selectedSeats: [],
  selectedCombos: [],
  promoCode: null,
  discountAmount: 0,
  holdId: null,
  holdExpiresAt: null,
  pendingBookingId: null,
};

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,

  setShowtime: (data) =>
    set({
      ...initialState,
      showtimeId: data.showtimeId,
      movieTitle: data.movieTitle,
      cinemaName: data.cinemaName,
      roomName: data.roomName,
      showDate: data.showDate,
      showTime: data.showTime,
      format: data.format,
    }),

  setSelectedSeats: (seats) => set({ selectedSeats: seats, promoCode: null, discountAmount: 0 }),

  toggleSeat: (seat) =>
    set((state) => {
      const exists = state.selectedSeats.find((s) => s.id === seat.id);
      if (exists) {
        return {
          selectedSeats: state.selectedSeats.filter((s) => s.id !== seat.id),
          promoCode: null,
          discountAmount: 0,
        };
      }
      if (state.selectedSeats.length >= 8) return state;
      return { selectedSeats: [...state.selectedSeats, seat], promoCode: null, discountAmount: 0 };
    }),

  setSelectedCombos: (combos) =>
    set({ selectedCombos: combos, promoCode: null, discountAmount: 0 }),

  updateComboQuantity: (comboId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          promoCode: null,
          discountAmount: 0,
          selectedCombos: state.selectedCombos.filter((c) => c.combo.id !== comboId),
        };
      }
      const existing = state.selectedCombos.find((c) => c.combo.id === comboId);
      if (existing) {
        return {
          promoCode: null,
          discountAmount: 0,
          selectedCombos: state.selectedCombos.map((c) =>
            c.combo.id === comboId ? { ...c, quantity } : c,
          ),
        };
      }
      return state;
    }),

  setPromoCode: (code, discount) => set({ promoCode: code, discountAmount: discount }),
  setHold: (holdId, expiresAt) => set({ holdId, holdExpiresAt: expiresAt, pendingBookingId: null }),
  clearHold: () => set({ holdId: null, holdExpiresAt: null, pendingBookingId: null }),
  setPendingBookingId: (id) => set({ pendingBookingId: id }),

  reset: () => set(initialState),

  getSeatsTotal: () => get().selectedSeats.reduce((sum, s) => sum + s.price, 0),
  getCombosTotal: () =>
    get().selectedCombos.reduce((sum, c) => sum + c.combo.price * c.quantity, 0),
  getGrandTotal: () => {
    const seats = get().getSeatsTotal();
    const combos = get().getCombosTotal();
    const discount = get().discountAmount;
    return Math.max(0, seats + combos - discount);
  },
}));
