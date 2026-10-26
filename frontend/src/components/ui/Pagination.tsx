/**
 * Component phân trang dùng chung.
 * Hiển thị các nút trang, trước/sau, và thông tin tổng mục.
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalElements?: number;
  pageSize?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  /** Tạo mảng số trang hiển thị */
  const getPages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(0);
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);

    if (start > 1) pages.push('ellipsis');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages - 1);

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      {totalElements !== undefined && pageSize !== undefined && (
        <p className="text-sm text-base-secondary">
          {t('common.showing')} {currentPage * pageSize + 1}–
          {Math.min((currentPage + 1) * pageSize, totalElements)} {t('common.of')} {totalElements}{' '}
          {t('common.items')}
        </p>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg text-base-secondary hover:bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t('common.previousPage')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPages().map((page, idx) =>
          page === 'ellipsis' ? (
            <span key={`e-${idx}`} className="px-2 text-base-tertiary">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors
                ${
                  page === currentPage
                    ? 'bg-primary-600 text-white'
                    : 'text-base-secondary hover:bg-tertiary'
                }
              `}
            >
              {page + 1}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg text-base-secondary hover:bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t('common.nextPage')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
