/** Đánh giá 1–5 sao: chỉ khách có vé đã chiếu được gửi; sửa/xóa đánh giá của mình. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { listReviewsApi, createReviewApi, updateReviewApi, deleteReviewApi } from '../api';
import { getMyBookingsApi } from '@/features/tickets/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import ErrorState from '@/components/common/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import type { Movie, Review } from '@/types';

const schema = z.object({
  rating: z.string().regex(/^[1-5]$/, 'reviews.rating'),
  comment: z.string().trim().min(1, 'errors.required').max(2000),
});
export default function MovieReviews({ movie }: { movie: Movie }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const client = useQueryClient();
  const { addToast } = useToast();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('newest');
  const [editing, setEditing] = useState<Review | null>(null);
  const [target, setTarget] = useState<Review | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { rating: '5', comment: '' },
  });
  const query = useQuery({
    queryKey: ['reviews', movie.id, sort, page],
    queryFn: () => listReviewsApi(movie.id, { page, size: 5, sort }).then((r) => r.data),
  });
  const tickets = useQuery({
    queryKey: ['reviewTickets', user?.id],
    queryFn: () => getMyBookingsApi({ status: 'WATCHED', size: 1000 }).then((r) => r.data.content),
    enabled: !!user,
  });
  const eligible = tickets.data?.some((b) => b.movieTitle === movie.title);
  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['reviews', movie.id] });
    void client.invalidateQueries({ queryKey: ['movie', movie.id] });
  };
  const save = useMutation({
    mutationFn: (values: z.infer<typeof schema>) =>
      editing
        ? updateReviewApi(editing.id, { ...values, rating: Number(values.rating) })
        : createReviewApi(movie.id, { ...values, rating: Number(values.rating) }),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      form.reset();
      addToast('success', t('common.updated'));
    },
    onError: () => addToast('error', t('common.error')),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteReviewApi(id),
    onSuccess: () => {
      invalidate();
      setTarget(null);
    },
    onError: () => addToast('error', t('common.error')),
  });
  const ownVisible = query.data?.content.some((r) => r.userId === user?.id);
  return (
    <section className="space-y-4 mb-12">
      <div className="flex flex-wrap gap-3 justify-between">
        <h2 className="text-xl font-bold">{t('reviews.title')}</h2>
        <Select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(0);
          }}
          options={[
            { value: 'newest', label: t('reviews.sortNewest') },
            { value: 'rating', label: t('reviews.sortHighest') },
          ]}
        />
      </div>
      {query.isLoading && <Skeleton count={3} />}
      {query.isError && <ErrorState onRetry={() => void query.refetch()} />}
      {query.data?.content.map((review) => (
        <article className="bg-card border rounded-xl p-4 space-y-2" key={review.id}>
          <p className="font-semibold">
            {review.userFullName}{' '}
            <span aria-label={t('reviews.rating')}>
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </span>
          </p>
          <p>{review.comment}</p>
          {review.userId === user?.id && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(review);
                  form.reset({ rating: String(review.rating), comment: review.comment });
                }}
              >
                {t('common.edit')}
              </Button>
              <Button variant="ghost" onClick={() => setTarget(review)}>
                {t('common.delete')}
              </Button>
            </div>
          )}
        </article>
      ))}
      {query.data?.content.length === 0 && <p>{t('reviews.noReviews')}</p>}
      {!!query.data && query.data.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={query.data.totalPages} onPageChange={setPage} />
      )}
      {editing || (eligible && !ownVisible) ? (
        <form
          className="space-y-3 bg-card p-4 rounded-xl border"
          onSubmit={form.handleSubmit((values) => save.mutate(values))}
        >
          <h3>{t(editing ? 'reviews.editReview' : 'reviews.writeReview')}</h3>
          <Select
            label={t('reviews.rating')}
            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: '★'.repeat(n) }))}
            {...form.register('rating')}
          />
          <Input
            label={t('reviews.comment')}
            {...form.register('comment')}
            error={form.formState.errors.comment ? t('errors.required') : undefined}
          />
          <Button type="submit" isLoading={save.isPending}>
            {t('reviews.submitReview')}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(null);
                form.reset();
              }}
            >
              {t('common.cancel')}
            </Button>
          )}
        </form>
      ) : (
        !eligible && <p>{t('reviews.mustWatch')}</p>
      )}
      <Modal isOpen={!!target} onClose={() => setTarget(null)} title={t('reviews.deleteReview')}>
        <p>{t('reviews.deleteConfirm')}</p>
        <Button
          variant="danger"
          isLoading={remove.isPending}
          onClick={() => target && remove.mutate(target.id)}
        >
          {t('common.delete')}
        </Button>
      </Modal>
    </section>
  );
}
