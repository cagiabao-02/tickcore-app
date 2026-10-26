/**
 * API service cho suất chiếu, rạp, thành phố.
 */
import httpClient from '@/lib/httpClient';
import type { Showtime, SeatMap } from './types';

/** Danh sách suất chiếu */
export const searchShowtimesApi = (params: {
  movieId?: number;
  cinemaId?: number;
  date?: string;
}) => httpClient.get<Showtime[]>('/showtimes', { params });

/** Chi tiết suất chiếu */
export const getShowtimeApi = (id: number) => httpClient.get<Showtime>(`/showtimes/${id}`);

/** Sơ đồ ghế */
export const getSeatMapApi = (showtimeId: number) =>
  httpClient.get<SeatMap>(`/showtimes/${showtimeId}/seats`);
