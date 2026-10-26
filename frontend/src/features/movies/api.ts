/**
 * API service cho phim và thể loại.
 */
import httpClient from '@/lib/httpClient';
import type { Movie, Genre, Page } from './types';

export interface MovieSearchParams {
  status?: string;
  genre?: string;
  language?: string;
  ageRating?: string;
  keyword?: string;
  sort?: string;
  page?: number;
  size?: number;
}

/** Danh sách phim (lọc, tìm kiếm, phân trang) */
export const searchMoviesApi = (params: MovieSearchParams) =>
  httpClient.get<Page<Movie>>('/movies', { params });

/** Chi tiết phim */
export const getMovieDetailApi = (id: number) => httpClient.get<Movie>(`/movies/${id}`);

/** Danh sách thể loại */
export const listGenresApi = () => httpClient.get<Genre[]>('/genres');
