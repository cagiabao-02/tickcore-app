/**
 * API service cho trang quản trị.
 */
import httpClient from '@/lib/httpClient';
import type {
  DashboardSummary,
  RevenueByDay,
  TopMovie,
  OccupancyByCinema,
  Movie,
  Cinema,
  Room,
  Showtime,
  Combo,
  Promotion,
  Booking,
  User,
  UserRoleHistory,
  Review,
  Page,
  SeatLayout,
  TicketPricing,
  Role,
  MessageResponse,
} from './types';

// Dashboard
export interface DateRange {
  from?: string;
  to?: string;
}
export const getDashboardSummaryApi = (params?: DateRange) =>
  httpClient.get<DashboardSummary>('/admin/dashboard/summary', { params });
export const getRevenueByDayApi = (params?: DateRange) =>
  httpClient.get<RevenueByDay[]>('/admin/dashboard/revenue', { params });
export const getTopMoviesApi = (params?: DateRange) =>
  httpClient.get<TopMovie[]>('/admin/dashboard/top-movies', { params });
export const getOccupancyApi = (params?: DateRange) =>
  httpClient.get<OccupancyByCinema[]>('/admin/dashboard/occupancy', { params });

// Admin CRUD chung
export const adminListMoviesApi = (params: { page?: number; size?: number; keyword?: string }) =>
  httpClient.get<Page<Movie>>('/admin/movies', { params });
export const adminCreateMovieApi = (data: Partial<Movie>) =>
  httpClient.post<Movie>('/admin/movies', data);
export const adminUpdateMovieApi = (id: number, data: Partial<Movie>) =>
  httpClient.put<Movie>(`/admin/movies/${id}`, data);
export const adminDeleteMovieApi = (id: number) =>
  httpClient.delete<MessageResponse>(`/admin/movies/${id}`);

export const adminListCinemasApi = () => httpClient.get<Page<Cinema>>('/admin/cinemas');
export const adminCreateCinemaApi = (data: Partial<Cinema>) =>
  httpClient.post<Cinema>('/admin/cinemas', data);
export const adminUpdateCinemaApi = (id: number, data: Partial<Cinema>) =>
  httpClient.put<Cinema>(`/admin/cinemas/${id}`, data);
export const adminDeleteCinemaApi = (id: number) =>
  httpClient.delete<MessageResponse>(`/admin/cinemas/${id}`);

export const adminListRoomsApi = (cinemaId?: number) =>
  httpClient.get<Page<Room>>('/admin/rooms', { params: cinemaId ? { cinemaId } : {} });
export const adminCreateRoomApi = (data: Partial<Room>) =>
  httpClient.post<Room>('/admin/rooms', data);

export const adminListShowtimesApi = (params: { page?: number; size?: number }) =>
  httpClient.get<Page<Showtime>>('/admin/showtimes', { params });
export const adminCreateShowtimeApi = (data: Partial<Showtime>) =>
  httpClient.post<Showtime>('/admin/showtimes', data);
export const adminDeleteShowtimeApi = (id: number) =>
  httpClient.delete<MessageResponse>(`/admin/showtimes/${id}`);

export const adminListCombosApi = () => httpClient.get<Page<Combo>>('/admin/combos');
export const adminCreateComboApi = (data: Partial<Combo>) =>
  httpClient.post<Combo>('/admin/combos', data);
export const adminUpdateComboApi = (id: number, data: Partial<Combo>) =>
  httpClient.put<Combo>(`/admin/combos/${id}`, data);
export const adminDeleteComboApi = (id: number) =>
  httpClient.delete<MessageResponse>(`/admin/combos/${id}`);

export const adminListPromotionsApi = () => httpClient.get<Page<Promotion>>('/admin/promotions');
export const adminCreatePromotionApi = (data: Partial<Promotion>) =>
  httpClient.post<Promotion>('/admin/promotions', data);
export const adminUpdatePromotionApi = (id: number, data: Partial<Promotion>) =>
  httpClient.put<Promotion>(`/admin/promotions/${id}`, data);
export const adminDeletePromotionApi = (id: number) =>
  httpClient.delete<MessageResponse>(`/admin/promotions/${id}`);

export const adminListBookingsApi = (params: { page?: number; size?: number }) =>
  httpClient.get<Page<Booking>>('/admin/bookings', { params });
export const adminCancelBookingApi = (id: number) =>
  httpClient.post<Booking>(`/admin/bookings/${id}/cancel`);
export const adminCheckInBookingApi = (ticketCode: string) =>
  httpClient.post<Booking>('/admin/bookings/check-in', { ticketCode });

export const adminListUsersApi = (keyword?: string) =>
  httpClient.get<Page<User>>('/admin/users', { params: { keyword, size: 1000 } });
export const adminUserRoleHistoryApi = (id: number, params: { page?: number; size?: number } = {}) =>
  httpClient.get<Page<UserRoleHistory>>(`/admin/users/${id}/role-history`, { params });
export const adminLockUserApi = (id: number) => httpClient.put<User>(`/admin/users/${id}/lock`);
export const adminUnlockUserApi = (id: number) => httpClient.put<User>(`/admin/users/${id}/unlock`);

export const adminListReviewsApi = () => httpClient.get<Page<Review>>('/admin/reviews');
export const adminToggleHideReviewApi = (id: number) =>
  httpClient.put<Review>(`/admin/reviews/${id}/hide`);
export const adminDeleteReviewApi = (id: number) =>
  httpClient.delete<MessageResponse>(`/admin/reviews/${id}`);

/** Hợp đồng CRUD dùng chung, vẫn giữ kiểu cụ thể cho từng tài nguyên. */
export interface AdminResources {
  movies: Movie;
  cinemas: Cinema;
  rooms: Room;
  showtimes: Showtime;
  combos: Combo;
  promotions: Promotion;
}
export type AdminResource = keyof AdminResources;
export type AdminItem = AdminResources[AdminResource];
export const listAdminResourceApi = <K extends AdminResource>(resource: K) =>
  httpClient.get<Page<AdminResources[K]>>(`/admin/${resource}`, { params: { size: 1000 } });
export const saveAdminResourceApi = (
  resource: AdminResource,
  data: Partial<AdminItem>,
  id?: number,
) =>
  id
    ? httpClient.put<AdminItem>(`/admin/${resource}/${id}`, data)
    : httpClient.post<AdminItem>(`/admin/${resource}`, data);
export const deleteAdminResourceApi = (resource: AdminResource, id: number) =>
  httpClient.delete<MessageResponse>(`/admin/${resource}/${id}`);
export const saveSeatLayoutApi = (id: number, data: SeatLayout) =>
  httpClient.put<SeatLayout>(`/admin/rooms/${id}/seat-layout`, data);
export const getPricingApi = () => httpClient.get<TicketPricing[]>('/admin/pricing');
export const savePricingApi = (data: TicketPricing[]) =>
  httpClient.put<TicketPricing[]>('/admin/pricing', data);
export const changeRoleApi = (id: number, role: Role) =>
  httpClient.put<User>(`/admin/users/${id}/role`, { role });
