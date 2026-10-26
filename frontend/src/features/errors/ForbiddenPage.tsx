/**
 * Trang 403 - Không có quyền truy cập.
 * Hiển thị khi USER cố vào trang ADMIN.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ShieldX } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ForbiddenPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <ShieldX className="h-24 w-24 text-error-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-base-primary mb-3">{t('page403.title')}</h1>
        <p className="text-base-secondary mb-8 max-w-md mx-auto">{t('page403.description')}</p>
        <Link to="/">
          <Button leftIcon={<Home className="h-4 w-4" />}>{t('page403.goHome')}</Button>
        </Link>
      </div>
    </div>
  );
}
