/**
 * MSW handler cho combo, mã giảm giá, đánh giá.
 */
import { http, HttpResponse, delay } from 'msw';
import { mockCombos, mockReviews, mockBookings, mockMovies } from '../data';
import { mockError, validatePromotion } from '../validation';
import { getUserFromToken } from './auth';
import type { Page } from '@/types';

/** Cập nhật điểm trung bình và tổng đánh giá sau khi dữ liệu mock thay đổi. */
function updateRating(movieId: number): void {
  const movie = mockMovies.find((m) => m.id === movieId);
  const visible = mockReviews.filter((r) => r.movieId === movieId && !r.hidden);
  if (movie) {
    movie.totalReviews = visible.length;
    movie.averageRating = visible.length
      ? Math.round((visible.reduce((sum, r) => sum + r.rating, 0) / visible.length) * 10) / 10
      : 0;
  }
}

export const comboHandlers = [
  // Danh sách combo đang bán
  http.get('/api/v1/combos', async () => {
    await delay(200);
    return HttpResponse.json(mockCombos.filter((c) => c.active));
  }),
];

export const promotionHandlers = [
  // Kiểm tra mã giảm giá
  http.post('/api/v1/promotions/validate', async ({ request }) => {
    await delay(400);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const body = (await request.json()) as { code: string; subtotal: number };
    return HttpResponse.json(validatePromotion(body.code, body.subtotal));
  }),
];

export const reviewHandlers = [
  // Danh sách đánh giá theo phim
  http.get('/api/v1/movies/:id/reviews', async ({ params, request }) => {
    await delay(300);
    const movieId = Number(params.id);
    const url = new URL(request.url);
    const sort = url.searchParams.get('sort') || 'newest';
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '5');

    const filtered = mockReviews.filter((r) => r.movieId === movieId && !r.hidden);
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = page * size;
    const content = filtered.slice(start, start + size);
    const result: Page<(typeof mockReviews)[0]> = {
      content,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    };
    return HttpResponse.json(result);
  }),

  // Viết đánh giá
  http.post('/api/v1/movies/:id/reviews', async ({ request, params }) => {
    await delay(400);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const body = (await request.json()) as { rating: number; comment: string };
    const movieId = Number(params.id);
    const movie = mockMovies.find((m) => m.id === movieId);
    if (!movie) return mockError(404, 'NOT_FOUND', 'Không tìm thấy phim');
    if (
      !mockBookings.some(
        (b) =>
          b.userId === user.id &&
          b.movieTitle === movie.title &&
          b.status === 'CONFIRMED' &&
          new Date(b.showtime).getTime() < Date.now(),
      )
    )
      return mockError(403, 'WATCH_REQUIRED', 'reviews.mustWatch');
    if (mockReviews.some((r) => r.userId === user.id && r.movieId === movieId))
      return mockError(409, 'REVIEW_EXISTS', 'Đã đánh giá phim');
    if (
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5 ||
      !body.comment.trim()
    )
      return mockError(400, 'INVALID_REVIEW', 'Đánh giá không hợp lệ');
    const newReview = {
      id: Math.max(0, ...mockReviews.map((r) => r.id)) + 1,
      userId: user.id,
      userFullName: user.fullName,
      userAvatarUrl: user.avatarUrl,
      movieId: Number(params.id),
      rating: body.rating,
      comment: body.comment,
      hidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReviews.push(newReview);
    updateRating(newReview.movieId);
    return HttpResponse.json(newReview, { status: 201 });
  }),

  // Sửa đánh giá
  http.put('/api/v1/reviews/:id', async ({ request, params }) => {
    await delay(300);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const body = (await request.json()) as { rating: number; comment: string };
    const review = mockReviews.find((r) => r.id === Number(params.id));
    if (!review)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy đánh giá' },
        { status: 404 },
      );
    if (review.userId !== user.id)
      return HttpResponse.json(
        { status: 403, code: 'FORBIDDEN', message: 'Không có quyền' },
        { status: 403 },
      );
    if (
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5 ||
      !body.comment.trim()
    )
      return mockError(400, 'INVALID_REVIEW', 'Đánh giá không hợp lệ');

    review.rating = body.rating;
    review.comment = body.comment;
    review.updatedAt = new Date().toISOString();
    updateRating(review.movieId);
    return HttpResponse.json(review);
  }),

  // Xóa đánh giá
  http.delete('/api/v1/reviews/:id', async ({ request, params }) => {
    await delay(300);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const idx = mockReviews.findIndex((r) => r.id === Number(params.id) && r.userId === user.id);
    if (idx === -1)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy đánh giá' },
        { status: 404 },
      );

    const [review] = mockReviews.splice(idx, 1);
    updateRating(review.movieId);
    return HttpResponse.json({ message: 'Đã xóa đánh giá' });
  }),
];
