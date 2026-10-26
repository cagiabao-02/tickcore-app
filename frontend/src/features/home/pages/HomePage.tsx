/**
 * Trang chủ TickCore.
 * Banner trượt tự động; hai khu "Đang chiếu" và "Sắp chiếu" dạng lưới poster;
 * ô tìm kiếm nhanh; khu combo và khuyến mãi nổi bật.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronRight, Star, Clock, ChevronLeft } from 'lucide-react';
import { getNowShowingApi, getComingSoonApi, getFeaturedCombosApi } from '../api';
import Button from '@/components/ui/Button';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDuration } from '@/lib/format';
import { useLanguageStore } from '@/stores/languageStore';
import type { Movie } from '@/types';
import ErrorState from '@/components/common/ErrorState';

/** Thẻ poster phim */
function MovieCard({ movie }: { movie: Movie }) {
  const { t } = useTranslation();
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <Button size="sm" fullWidth>
            {t('home.bookNow')}
          </Button>
        </div>
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

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);

  const {
    data: nowShowing,
    isLoading: loadingNow,
    error,
    refetch,
  } = useQuery({
    queryKey: ['movies', 'nowShowing'],
    queryFn: () => getNowShowingApi().then((r) => r.data),
  });

  const { data: comingSoon, isLoading: loadingComing } = useQuery({
    queryKey: ['movies', 'comingSoon'],
    queryFn: () => getComingSoonApi().then((r) => r.data),
  });

  const { data: combos } = useQuery({
    queryKey: ['combos', 'featured'],
    queryFn: () => getFeaturedCombosApi().then((r) => r.data),
  });

  // Banner phim có ảnh banner
  const bannerMovies = (nowShowing?.content || []).filter((m) => m.bannerUrl);

  // Auto-slide banner
  useEffect(() => {
    if (bannerMovies.length <= 1) return;
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % bannerMovies.length), 5000);
    return () => clearInterval(timer);
  }, [bannerMovies.length]);

  const handleSearch = () => {
    if (searchQuery.trim()) navigate(`/movies?keyword=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (error) return <ErrorState onRetry={() => void refetch()} />;
  return (
    <div className="animate-fade-in">
      {/* === BANNER === */}
      {bannerMovies.length > 0 && (
        <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
          {bannerMovies.map((movie, i) => (
            <div
              key={movie.id}
              aria-hidden={i !== bannerIdx}
              className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
              <img
                src={movie.bannerUrl || movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">{movie.title}</h2>
                <p className="text-sm sm:text-base text-gray-300 max-w-lg line-clamp-2 mb-4">
                  {movie.description}
                </p>
                <div className="flex gap-3">
                  <Link to={`/movies/${movie.id}`}>
                    <Button size="lg">{t('home.bookNow')}</Button>
                  </Link>
                  <Link to={`/movies/${movie.id}`}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      {t('home.viewDetails')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {/* Banner nav */}
          {bannerMovies.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                aria-label={t('home.bannerPrevious')}
                onClick={() =>
                  setBannerIdx((i) => (i - 1 + bannerMovies.length) % bannerMovies.length)
                }
                className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label={t('home.bannerNext')}
                onClick={() => setBannerIdx((i) => (i + 1) % bannerMovies.length)}
                className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {bannerMovies.map((_, i) => (
              <button
                key={i}
                aria-label={t('home.bannerSelect', { index: i + 1 })}
                onClick={() => setBannerIdx(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === bannerIdx ? 'bg-primary-500 w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* === TÌM KIẾM === */}
        <div className="relative -mt-8 z-10 max-w-2xl mx-auto">
          <div className="flex bg-card rounded-2xl shadow-theme-xl border border-base-primary overflow-hidden">
            <div className="flex-1 flex items-center px-4 gap-3">
              <Search className="h-5 w-5 text-base-tertiary flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('home.searchPlaceholder')}
                className="flex-1 py-4 bg-transparent text-base-primary placeholder:text-base-tertiary focus:outline-none"
                aria-label={t('home.searchPlaceholder')}
              />
            </div>
            <Button size="lg" className="rounded-none rounded-r-2xl px-8" onClick={handleSearch}>
              {t('common.search')}
            </Button>
          </div>
        </div>

        {/* === ĐANG CHIẾU === */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-base-primary">{t('home.nowShowing')}</h2>
            <Link
              to="/movies?status=NOW_SHOWING"
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('common.viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {loadingNow
              ? Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : nowShowing?.content.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        </section>

        {/* === SẮP CHIẾU === */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-base-primary">{t('home.comingSoon')}</h2>
            <Link
              to="/movies?status=COMING_SOON"
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('common.viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {loadingComing
              ? Array.from({ length: 4 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : comingSoon?.content.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold">{t('home.featuredPromotions')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {['home.promoWelcome', 'home.promoFixed'].map((key) => (
              <p className="bg-card border rounded-xl p-5" key={key}>
                {t(key)}
              </p>
            ))}
          </div>
        </section>
        {/* === COMBO NỔI BẬT === */}
        {combos && combos.length > 0 && (
          <section className="mt-16 mb-16">
            <h2 className="text-2xl font-bold text-base-primary mb-6">
              {t('home.featuredCombos')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {combos.slice(0, 3).map((combo) => (
                <div
                  key={combo.id}
                  className="bg-card rounded-xl border border-base-primary overflow-hidden shadow-theme-sm hover:shadow-theme-md transition-shadow"
                >
                  <img
                    src={combo.imageUrl}
                    alt={combo.name}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-base-primary">{combo.name}</h3>
                    <p className="text-sm text-base-secondary mt-1">{combo.description}</p>
                    <p className="text-lg font-bold text-primary-600 mt-2">
                      {formatCurrency(combo.price, language)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
