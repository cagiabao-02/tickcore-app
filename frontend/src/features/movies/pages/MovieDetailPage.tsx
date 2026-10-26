/**
 * Trang chi tiết phim.
 * Poster, trailer, thông tin, lịch chiếu theo ngày và rạp, khu đánh giá.
 */
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, MapPin, Play, Ticket } from 'lucide-react';
import { getMovieDetailApi } from '../api';
import { searchShowtimesApi } from '@/features/showtimes/api';
import { listCitiesApi, listCinemasApi } from '@/features/cinemas/api';
import MovieReviews from '@/features/reviews/components/MovieReviews';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/common/ErrorState';

import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useLanguageStore } from '@/stores/languageStore';
import { formatDate, formatDuration, formatTime, isPast, toISODate } from '@/lib/format';
import { addDays } from 'date-fns';
import type { Showtime } from '@/types';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { user } = useAuthStore();
  const { setShowtime } = useBookingStore();
  const movieId = Number(id);

  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));

  // 7 ngày tới
  const dates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(new Date(), i);
        return {
          value: toISODate(d),
          label:
            i === 0
              ? t('showtimes.today')
              : i === 1
                ? t('showtimes.tomorrow')
                : formatDate(toISODate(d), language),
        };
      }),
    [language, t],
  );

  const {
    data: movie,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => getMovieDetailApi(movieId).then((r) => r.data),
    enabled: !!movieId,
  });

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => listCitiesApi().then((r) => r.data),
  });
  const { data: cinemas } = useQuery({
    queryKey: ['cinemas', selectedCityId],
    queryFn: () =>
      listCinemasApi(selectedCityId ? Number(selectedCityId) : undefined).then((r) => r.data),
  });

  const {
    data: showtimes,
    isLoading: loadingShowtimes,
    error: showtimesError,
    refetch: refetchShowtimes,
  } = useQuery({
    queryKey: ['showtimes', movieId, selectedCinemaId, selectedDate],
    queryFn: () =>
      searchShowtimesApi({
        movieId,
        cinemaId: selectedCinemaId ? Number(selectedCinemaId) : undefined,
        date: selectedDate,
      }).then((r) => r.data),
    enabled: movie?.status === 'NOW_SHOWING',
  });

  // Nhóm suất chiếu theo rạp
  const showtimesByCinema = useMemo(() => {
    if (!showtimes) return new Map<string, Showtime[]>();
    const map = new Map<string, Showtime[]>();
    for (const st of showtimes) {
      if (selectedCityId && !cinemas?.some((c) => c.id === st.cinemaId)) continue;
      const key = st.cinemaName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(st);
    }
    return map;
  }, [showtimes, selectedCityId, cinemas]);

  const handleSelectShowtime = (st: Showtime) => {
    if (!user) {
      navigate(`/login?redirect=/movies/${movieId}`);
      return;
    }
    setShowtime({
      showtimeId: st.id,
      movieTitle: st.movieTitle,
      cinemaName: st.cinemaName,
      roomName: st.roomName,
      showDate: st.date,
      showTime: formatTime(st.startTime),
      format: st.format,
    });
    navigate(`/booking/${st.id}/seats`);
  };

  if (isLoading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton variant="rectangular" className="w-64 h-96 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" count={3} />
          </div>
        </div>
      </div>
    );

  if (error || !movie) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <div className="relative bg-gradient-to-b from-gray-900 to-transparent">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt=""
            className="w-full h-full object-cover opacity-20 blur-xl"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-48 sm:w-64 rounded-xl shadow-2xl"
              />
            </div>
            {/* Info */}
            <div className="flex-1 text-white">
              <h1 className="text-2xl sm:text-4xl font-bold">{movie.title}</h1>
              {movie.originalTitle !== movie.title && (
                <p className="text-gray-400 mt-1">{movie.originalTitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                {movie.averageRating > 0 && (
                  <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-bold">
                    <Star className="h-4 w-4 fill-yellow-400" /> {movie.averageRating} (
                    {movie.totalReviews})
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {formatDuration(movie.duration, language)}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded">{movie.ageRating}</span>
                <span>{movie.language}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {movie.genres.map((g) => (
                  <span key={g.id} className="text-xs bg-white/10 px-3 py-1 rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                <div>
                  <span className="text-gray-400">{t('movies.director')}:</span>{' '}
                  <span className="font-medium">{movie.director}</span>
                </div>
                <div>
                  <span className="text-gray-400">{t('movies.cast')}:</span>{' '}
                  <span className="font-medium">{movie.cast}</span>
                </div>
                <div>
                  <span className="text-gray-400">{t('movies.releaseDate')}:</span>{' '}
                  <span className="font-medium">{formatDate(movie.releaseDate, language)}</span>
                </div>
              </div>
              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Play className="h-5 w-5" /> {t('movies.trailer')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Mô tả */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-base-primary mb-3">{t('movies.description')}</h2>
          <p className="text-base-secondary leading-relaxed">{movie.description}</p>
          {movie.trailerUrl && /youtube\.com\/watch\?v=|youtu\.be\//.test(movie.trailerUrl) && (
            <iframe
              className="w-full aspect-video rounded-xl mt-6"
              src={movie.trailerUrl
                .replace('watch?v=', 'embed/')
                .replace('youtu.be/', 'www.youtube.com/embed/')}
              title={t('movies.trailer')}
              allowFullScreen
              loading="lazy"
            />
          )}
        </section>

        {/* Lịch chiếu */}
        {movie.status === 'NOW_SHOWING' && (
          <section id="showtimes" className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-base-primary">{t('showtimes.title')}</h2>
              <Button
                size="sm"
                onClick={() =>
                  document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth' })
                }
                leftIcon={<Ticket className="h-4 w-4" />}
              >
                {t('movies.bookTicket')}
              </Button>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Select
                options={[
                  { value: '', label: t('showtimes.selectCity') },
                  ...(cities?.map((c) => ({ value: String(c.id), label: c.name })) || []),
                ]}
                value={selectedCityId}
                onChange={(e) => {
                  setSelectedCityId(e.target.value);
                  setSelectedCinemaId('');
                }}
              />
              <Select
                options={[
                  { value: '', label: t('showtimes.selectCinema') },
                  ...(cinemas?.map((c) => ({ value: String(c.id), label: c.name })) || []),
                ]}
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
              />
            </div>

            {/* Thanh ngày */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDate(d.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedDate === d.value ? 'bg-primary-600 text-white' : 'bg-secondary text-base-secondary hover:bg-tertiary'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Suất chiếu theo rạp */}
            {showtimesError ? (
              <ErrorState onRetry={() => void refetchShowtimes()} />
            ) : loadingShowtimes ? (
              <Skeleton count={3} />
            ) : showtimesByCinema.size === 0 ? (
              <p className="text-base-tertiary text-center py-8">{t('movies.noShowtimes')}</p>
            ) : (
              <div className="space-y-6">
                {Array.from(showtimesByCinema.entries()).map(([cinemaName, sts]) => (
                  <div
                    key={cinemaName}
                    className="bg-card rounded-xl border border-base-primary p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-primary-500" />
                      <h3 className="font-semibold text-base-primary">{cinemaName}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sts.map((st) => {
                        const passed = isPast(st.startTime);
                        return (
                          <button
                            key={st.id}
                            onClick={() => !passed && handleSelectShowtime(st)}
                            disabled={passed}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                              passed
                                ? 'opacity-40 cursor-not-allowed border-base-primary text-base-tertiary'
                                : 'border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-950'
                            }`}
                          >
                            <span className="font-bold">{formatTime(st.startTime)}</span>
                            <span className="text-xs ml-2 opacity-70">
                              {st.format} •{' '}
                              {st.subtitleType === 'SUBTITLED'
                                ? t('showtimes.subtitled')
                                : t('showtimes.dubbed')}
                            </span>
                            <div className="text-xs mt-0.5 opacity-60">
                              {st.availableSeats} {t('showtimes.seatsAvailable')}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <MovieReviews movie={movie} />
      </div>
    </div>
  );
}
