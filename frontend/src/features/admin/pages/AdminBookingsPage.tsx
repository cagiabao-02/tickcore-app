/**
 * Trang quản lý đơn đặt vé (Admin).
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { XCircle } from 'lucide-react';
import { adminListBookingsApi, adminCancelBookingApi } from '../api';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { useLanguageStore } from '@/stores/languageStore';
import type { Booking } from '@/types';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import ErrorState from '@/components/common/ErrorState';

export default function AdminBookingsPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [movie, setMovie] = useState('');
  const [target, setTarget] = useState<Booking | null>(null);
  const [detail, setDetail] = useState<Booking | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'bookings', page],
    queryFn: () => adminListBookingsApi({ page: 0, size: 1000 }).then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => adminCancelBookingApi(id),
    onSuccess: () => {
      setTarget(null);
      addToast('success', t('common.updated'));
      void queryClient.invalidateQueries();
    },
  });

  const columns: Column<Booking>[] = [
    {
      key: 'bookingCode',
      sortable: true,
      header: t('booking.bookingCode'),
      render: (b) => (
        <button className="font-mono text-sm font-bold underline" onClick={() => setDetail(b)}>
          {b.bookingCode}
        </button>
      ),
    },
    {
      key: 'movie',
      header: t('admin.movie'),
      render: (b) => <span className="text-sm">{b.movieTitle}</span>,
    },
    {
      key: 'cinema',
      header: t('admin.cinema'),
      render: (b) => <span className="text-xs">{b.cinemaName}</span>,
    },
    {
      key: 'date',
      header: t('common.date'),
      render: (b) => (
        <span className="text-xs">
          {formatDate(b.showDate, language)} {formatTime(b.showtime)}
        </span>
      ),
    },
    {
      key: 'seats',
      header: t('booking.seatsInfo'),
      render: (b) => b.seats.map((s) => s.label).join(', '),
    },
    {
      key: 'total',
      header: t('common.total'),
      render: (b) => formatCurrency(b.totalAmount, language),
    },
    {
      key: 'status',
      header: t('admin.status'),
      render: (b) => (
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            b.status === 'CONFIRMED'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : b.status === 'CANCELLED'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}
        >
          {t(`values.${b.status}`)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (b) =>
        b.status === 'CONFIRMED' ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-error-500"
            onClick={() => setTarget(b)}
            leftIcon={<XCircle className="h-3.5 w-3.5" />}
          >
            {t('tickets.cancel')}
          </Button>
        ) : null,
    },
  ];

  if (error) return <ErrorState onRetry={() => void refetch()} />;
  const filtered = (data?.content || []).filter(
    (b) =>
      (!status || b.status === status) &&
      (!date || b.showDate === date) &&
      b.movieTitle.toLocaleLowerCase().includes(movie.toLocaleLowerCase()),
  );
  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="text-2xl font-bold text-base-primary">{t('admin.bookings')}</h1>
      <div className="flex flex-wrap gap-3">
        <Select
          label={t('common.status')}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          options={[
            { value: '', label: t('common.all') },
            ...['CONFIRMED', 'PENDING', 'CANCELLED', 'EXPIRED'].map((value) => ({
              value,
              label: t(`values.${value}`),
            })),
          ]}
        />
        <Input
          type="date"
          label={t('common.date')}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input label={t('admin.movie')} value={movie} onChange={(e) => setMovie(e.target.value)} />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(b) => b.id}
        isLoading={isLoading}
      />
      <Modal isOpen={!!target} onClose={() => setTarget(null)} title={t('tickets.confirmCancel')}>
        <p>{t('tickets.confirmCancelMsg')}</p>
        <Button
          variant="danger"
          isLoading={cancelMutation.isPending}
          onClick={() => target && cancelMutation.mutate(target.id)}
        >
          {t('common.confirm')}
        </Button>
      </Modal>
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail?.bookingCode}>
        <p>{detail?.movieTitle}</p>
        <p>
          {detail?.cinemaName} · {detail?.roomName}
        </p>
        <p>
          {detail && formatDate(detail.showDate, language)} ·{' '}
          {detail && formatTime(detail.showtime)}
        </p>
        <p>
          {t('booking.seatsInfo')}: {detail?.seats.map((s) => s.label).join(', ')}
        </p>
        <p>
          {t('common.total')}: {detail && formatCurrency(detail.totalAmount, language)}
        </p>
      </Modal>
      {data && data.totalPages > 1 && (
        <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
