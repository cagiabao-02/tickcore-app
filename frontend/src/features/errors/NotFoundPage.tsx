/**
 * Trang 404 - Không tìm thấy.
 * Hiển thị khi người dùng truy cập đường dẫn không tồn tại.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, FileQuestion } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <FileQuestion className="h-24 w-24 text-primary-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-base-primary mb-3">{t('page404.title')}</h1>
        <p className="text-base-secondary mb-8 max-w-md mx-auto">{t('page404.description')}</p>
        <Link to="/">
          <Button leftIcon={<Home className="h-4 w-4" />}>{t('page404.goHome')}</Button>
        </Link>
      </div>
    </div>
  );
}
