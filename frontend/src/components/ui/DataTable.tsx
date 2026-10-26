/**
 * Component bảng dữ liệu dùng chung cho admin.
 * Hỗ trợ sắp xếp theo cột, trạng thái tải, trạng thái rỗng.
 */
import { useState, type ReactNode } from 'react';
import Pagination from './Pagination';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Skeleton from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyMessage?: string;
  skeletonRows?: number;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  sortBy,
  sortDir,
  onSort,
  emptyMessage,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [localSort, setLocalSort] = useState('');
  const [localDirection, setLocalDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const sortKey = sortBy || localSort;
  const direction = sortDir || localDirection;
  const sorted =
    !onSort && sortKey
      ? [...data].sort((a, b) => {
          const left = (a as Record<string, unknown>)[sortKey];
          const right = (b as Record<string, unknown>)[sortKey];
          return (
            (typeof left === 'number' && typeof right === 'number'
              ? left - right
              : String(left ?? '').localeCompare(String(right ?? ''))) *
            (direction === 'asc' ? 1 : -1)
          );
        })
      : data;
  const pages = Math.ceil(sorted.length / 10);
  const current = Math.min(page, Math.max(0, pages - 1));
  const visible = sorted.slice(current * 10, (current + 1) * 10);
  const handleSort =
    onSort ||
    ((key: string) => {
      setLocalSort(key);
      setLocalDirection(localSort === key && localDirection === 'asc' ? 'desc' : 'asc');
      setPage(0);
    });

  /** Icon sắp xếp theo trạng thái */
  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 opacity-40" />;
    return direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-primary-500" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary-500" />
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-base-primary">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary border-b border-base-primary">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-base-secondary ${col.className || ''}`}
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-base-primary transition-colors"
                  >
                    {col.header}
                    {getSortIcon(col.key)}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-base-primary">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-base-tertiary">
                {emptyMessage || t('common.noData')}
              </td>
            </tr>
          ) : (
            visible.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="border-b border-base-primary hover:bg-secondary transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-base-primary ${col.className || ''}`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pages > 1 && <Pagination currentPage={current} totalPages={pages} onPageChange={setPage} />}
    </div>
  );
}
