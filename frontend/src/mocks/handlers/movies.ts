/**
 * MSW handler cho phim, thể loại, thành phố, rạp.
 */
import { http, HttpResponse, delay } from 'msw';
import { mockMovies, mockGenres, mockCities, mockCinemas } from '../data';
import type { Page } from '@/types';

export const movieHandlers = [
  // Danh sách phim (phân trang, lọc)
  http.get('/api/v1/movies', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const genre = url.searchParams.get('genre');
    const language = url.searchParams.get('language');
    const ageRating = url.searchParams.get('ageRating');
    const keyword = url.searchParams.get('keyword');
    const sort = url.searchParams.get('sort') || 'newest';
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '12');

    let filtered = [...mockMovies];
    if (status) filtered = filtered.filter((m) => m.status === status);
    if (genre) filtered = filtered.filter((m) => m.genres.some((g) => g.slug === genre));
    if (language) filtered = filtered.filter((m) => m.language === language);
    if (ageRating) filtered = filtered.filter((m) => m.ageRating === ageRating);
    if (keyword)
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(keyword.toLowerCase()) ||
          m.originalTitle.toLowerCase().includes(keyword.toLowerCase()),
      );

    if (sort === 'rating') filtered.sort((a, b) => b.averageRating - a.averageRating);
    else
      filtered.sort(
        (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
      );

    const start = page * size;
    const content = filtered.slice(start, start + size);
    const result: Page<(typeof mockMovies)[0]> = {
      content,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    };
    return HttpResponse.json(result);
  }),

  // Chi tiết phim
  http.get('/api/v1/movies/:id', async ({ params }) => {
    await delay(300);
    const id = Number(params.id);
    const movie = mockMovies.find((m) => m.id === id);
    if (!movie)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy phim' },
        { status: 404 },
      );
    return HttpResponse.json(movie);
  }),

  // Danh sách thể loại
  http.get('/api/v1/genres', async () => {
    await delay(200);
    return HttpResponse.json(mockGenres);
  }),

  // Danh sách thành phố
  http.get('/api/v1/cities', async () => {
    await delay(200);
    return HttpResponse.json(mockCities);
  }),

  // Danh sách rạp
  http.get('/api/v1/cinemas', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const cityId = url.searchParams.get('city');
    let filtered = [...mockCinemas];
    if (cityId) filtered = filtered.filter((c) => c.city.id === Number(cityId));
    return HttpResponse.json(filtered);
  }),

  // Chi tiết rạp
  http.get('/api/v1/cinemas/:id', async ({ params }) => {
    await delay(200);
    const cinema = mockCinemas.find((c) => c.id === Number(params.id));
    if (!cinema)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy rạp' },
        { status: 404 },
      );
    return HttpResponse.json(cinema);
  }),
];
