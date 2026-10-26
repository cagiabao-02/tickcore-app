/**
 * API service cho trang chủ.
 */
import httpClient from '@/lib/httpClient';
import type { Movie, Combo, Page } from './types';

/** Phim đang chiếu */
export const getNowShowingApi = () =>
  httpClient.get<Page<Movie>>('/movies', { params: { status: 'NOW_SHOWING', size: 8 } });

/** Phim sắp chiếu */
export const getComingSoonApi = () =>
  httpClient.get<Page<Movie>>('/movies', { params: { status: 'COMING_SOON', size: 4 } });

/** Combo nổi bật */
export const getFeaturedCombosApi = () => httpClient.get<Combo[]>('/combos');
