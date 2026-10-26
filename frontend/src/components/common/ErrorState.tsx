/**
 * Component trạng thái lỗi - hiển thị khi gặp lỗi kèm nút thử lại.
 */
import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isNetworkError?: boolean;
}

export default function ErrorState({ title, message, onRetry, isNetworkError }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="mb-4 text-error-500">
        {isNetworkError ? (
          <WifiOff className="h-16 w-16" />
        ) : (
          <AlertTriangle className="h-16 w-16" />
        )}
      </div>
      <h3 className="text-lg font-medium text-base-primary mb-2">{title || t('common.error')}</h3>
      <p className="text-sm text-base-secondary max-w-md mb-4">
        {message || (isNetworkError ? t('common.networkError') : t('errors.serverError'))}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
