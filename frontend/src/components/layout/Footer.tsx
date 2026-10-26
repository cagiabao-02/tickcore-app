/**
 * Footer chính của ứng dụng.
 * Hiển thị thông tin bản quyền, liên kết và logo.
 */
import { Film } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-secondary border-t border-base-primary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & mô tả */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-primary-600 rounded-lg">
                <Film className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-base-primary">
                Tick<span className="text-primary-600">Core</span>
              </span>
            </Link>
            <p className="text-sm text-base-secondary">{t('home.bannerSub')}</p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h4 className="text-sm font-semibold text-base-primary mb-3">{t('nav.movies')}</h4>
            <div className="flex flex-col gap-2">
              <Link
                to="/movies?status=NOW_SHOWING"
                className="text-sm text-base-secondary hover:text-primary-500 transition-colors"
              >
                {t('movies.nowShowing')}
              </Link>
              <Link
                to="/movies?status=COMING_SOON"
                className="text-sm text-base-secondary hover:text-primary-500 transition-colors"
              >
                {t('movies.comingSoon')}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-base-primary mb-3">{t('nav.cinemas')}</h4>
            <p className="text-sm text-base-secondary">{t('footer.cinemaSystem')}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-base-primary mb-3">TickCore</h4>
            <p className="text-sm text-base-secondary">{t('footer.email')}</p>
            <p className="text-sm text-base-secondary">{t('footer.phone')}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-base-primary text-center">
          <p className="text-sm text-base-tertiary">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
