/**
 * Trang danh sách phim.
 * Tab Đang chiếu / Sắp chiếu; lọc theo thể loại, ngôn ngữ, độ tuổi;
 * tìm theo tên có debounce; sắp xếp; phân trang; trạng thái lọc trên URL.
 */
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, Clock } from 'lucide-react';
import { searchMoviesApi, listGenresApi } from '../api';
import Tabs from '@/components/ui/Tabs';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDuration } from '@/lib/format';
import { useLanguageStore } from '@/stores/languageStore';
import type { Movie } from '@/types';

function MovieCard({ movie }: { movie: Movie }) {
  const { language } = useLanguageStore();
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-theme-sm hover:shadow-theme-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-lg">
          {movie.ageRating}
        </div>
        {movie.averageRating > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg">
            <Star className="h-3 w-3 fill-yellow-400" /> {movie.averageRating}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-base-primary text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-base-tertiary">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatDuration(movie.duration, language)}
          </span>
          <span>•</span>
          <span className="line-clamp-1">{movie.genres.map((g) => g.name).join(', ')}</span>
        </div>
      </div>
    </Link>
  );
}

export default function MoviesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || 'NOW_SHOWING';
  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '0');
  const keyword = searchParams.get('keyword') || '';
  const movieLanguage = searchParams.get('language') || '';
  const ageRating = searchParams.get('ageRating') || '';
  const debouncedKeyword = useDebounce(keyword, 400);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (!updates.page) params.set('page', '0');
    setSearchParams(params);
  };

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => listGenresApi().then((r) => r.data),
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['movies', status, genre, movieLanguage, ageRating, debouncedKeyword, sort, page],
    queryFn: () =>
      searchMoviesApi({
        status,
        genre: genre || undefined,
        language: movieLanguage || undefined,
        ageRating: ageRating || undefined,
        keyword: debouncedKeyword || undefined,
        sort,
        page,
        size: 12,
      }).then((r) => r.data),
  });

  if (error) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-base-primary mb-6">{t('movies.title')}</h1>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: 'NOW_SHOWING', label: t('movies.nowShowing') },
          { key: 'COMING_SOON', label: t('movies.comingSoon') },
        ]}
        activeTab={status}
        onChange={(key) => updateParams({ status: key })}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mt-6">
        <div className="flex-1">
          <Input
            placeholder={t('home.searchPlaceholder')}
            value={keyword}
            onChange={(e) => updateParams({ keyword: e.target.value })}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          options={[
            { value: '', label: t('movies.allGenres') },
            ...(genres?.map((g) => ({ value: g.slug, label: g.name })) || []),
          ]}
          value={genre}
          onChange={(e) => updateParams({ genre: e.target.value })}
        />
        <Select
          aria-label={t('movies.language')}
          value={movieLanguage}
          onChange={(e) => updateParams({ language: e.target.value })}
          options={[
            { value: '', label: t('movies.allLanguages') },
            ...['Tiếng Việt', 'Tiếng Anh', 'Tiếng Hàn', 'Tiếng Nhật'].map((value, index) => ({
              value,
              label: t(`languages.${index}`),
            })),
          ]}
        />
        <Select
          aria-label={t('movies.ageRating')}
          value={ageRating}
          onChange={(e) => updateParams({ ageRating: e.target.value })}
          options={[
            { value: '', label: t('movies.allAges') },
            ...['P', 'K', 'T13', 'T16', 'T18'].map((value) => ({ value, label: value })),
          ]}
        />
        <Select
          options={[
            { value: 'newest', label: t('movies.sortNewest') },
            { value: 'rating', label: t('movies.sortRating') },
          ]}
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mt-8">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : data?.content.length === 0
            ? null
            : data?.content.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>

      {!isLoading && data?.content.length === 0 && <EmptyState title={t('common.noResults')} />}

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={data.size}
          onPageChange={(p) => updateParams({ page: String(p) })}
        />
      )}
    </div>
  );
}
