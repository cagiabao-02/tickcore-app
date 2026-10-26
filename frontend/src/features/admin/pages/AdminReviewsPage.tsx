/**
 * Trang quản lý đánh giá (Admin).
 * Ẩn/hiện, xóa đánh giá vi phạm.
 */
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import ErrorState from '@/components/common/ErrorState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EyeOff, Eye, Trash2, Star } from 'lucide-react';
import { adminListReviewsApi, adminToggleHideReviewApi, adminDeleteReviewApi } from '../api';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Review } from '@/types';

export default function AdminReviewsPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<Review | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => adminListReviewsApi().then((r) => r.data),
  });

  const hideMutation = useMutation({
    mutationFn: (id: number) => adminToggleHideReviewApi(id),
    onSuccess: () => {
      addToast('success', t('common.updated'));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteReviewApi(id),
    onSuccess: () => {
      setTarget(null);
      addToast('success', t('common.deleted'));
      void queryClient.invalidateQueries();
    },
  });

  const columns: Column<Review>[] = [
    {
      key: 'userFullName',
      sortable: true,
      header: t('admin.user'),
      render: (r) => <span className="text-sm font-medium">{r.userFullName}</span>,
    },
    {
      key: 'movieId',
      sortable: true,
      header: t('admin.movie'),
      render: (r) => (
        <span className="text-sm">
          {t('admin.movie')} #{r.movieId}
        </span>
      ),
    },
    {
      key: 'rating',
      header: t('reviews.title'),
      render: (r) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'comment',
      header: t('admin.comment'),
      render: (r) => (
        <p className="text-sm text-base-secondary line-clamp-2 max-w-xs">{r.comment}</p>
      ),
    },
    {
      key: 'hidden',
      header: t('admin.status'),
      render: (r) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${r.hidden ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}
        >
          {r.hidden ? t('admin.hidden') : t('admin.visible')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => hideMutation.mutate(r.id)}
            leftIcon={
              r.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />
            }
          >
            {r.hidden ? t('admin.show') : t('admin.hide')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error-500"
            onClick={() => setTarget(r)}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            {t('common.delete')}
          </Button>
        </div>
      ),
    },
  ];

  if (error) return <ErrorState onRetry={() => void refetch()} />;
  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="text-2xl font-bold text-base-primary">{t('admin.reviewsMgmt')}</h1>
      <DataTable
        columns={columns}
        data={data?.content || []}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
      />
      <Modal isOpen={!!target} onClose={() => setTarget(null)} title={t('common.confirmDelete')}>
        <p>{t('reviews.deleteConfirm')}</p>
        <Button
          variant="danger"
          isLoading={deleteMutation.isPending}
          onClick={() => target && deleteMutation.mutate(target.id)}
        >
          {t('common.delete')}
        </Button>
      </Modal>
    </div>
  );
}
