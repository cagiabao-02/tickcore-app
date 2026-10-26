/**
 * API service cho đánh giá phim.
 */
import httpClient from '@/lib/httpClient';
import type { Review, Page, MessageResponse } from './types';

/** Danh sách đánh giá theo phim */
export const listReviewsApi = (
  movieId: number,
  params: { sort?: string; page?: number; size?: number },
) => httpClient.get<Page<Review>>(`/movies/${movieId}/reviews`, { params });

/** Viết đánh giá */
export const createReviewApi = (movieId: number, data: { rating: number; comment: string }) =>
  httpClient.post<Review>(`/movies/${movieId}/reviews`, data);

/** Sửa đánh giá */
export const updateReviewApi = (id: number, data: { rating: number; comment: string }) =>
  httpClient.put<Review>(`/reviews/${id}`, data);

/** Xóa đánh giá */
export const deleteReviewApi = (id: number) => httpClient.delete<MessageResponse>(`/reviews/${id}`);
