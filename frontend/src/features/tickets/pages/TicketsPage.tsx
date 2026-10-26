/**
 * Trang vé của tôi.
 * Tab: Sắp xem / Đã xem / Đã hủy; mỗi vé hiện poster, thông tin, trạng thái;
 * nút hủy vé (nếu còn trên 2 giờ trước giờ chiếu); phân trang.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, Calendar, MapPin, XCircle } from 'lucide-react';
import { getMyBookingsApi, cancelBookingApi } from '../api';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useLanguageStore } from '@/stores/languageStore';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import type { Booking } from '@/types';

export default function TicketsPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState('UPCOMING');
  const [page, setPage] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['myBookings', tab, page],
    queryFn: () => getMyBookingsApi({ status: tab, page, size: 5 }).then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelBookingApi(id),
    onSuccess: () => {
      addToast('success', t('tickets.cancelSuccess'));
      setCancelTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: () => addToast('error', t('errors.serverError')),
  });

  const canCancel = (booking: Booking) => {
    if (booking.status !== 'CONFIRMED') return false;
    const showTime = new Date(booking.showtime).getTime();
    return Date.now() < showTime - 2 * 60 * 60 * 1000;
  };

  if (error) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-base-primary mb-6">{t('nav.myTickets')}</h1>

      <Tabs
        tabs={[
          { key: 'UPCOMING', label: t('tickets.upcoming') },
          { key: 'WATCHED', label: t('tickets.watched') },
          { key: 'CANCELLED', label: t('tickets.cancelled') },
        ]}
        activeTab={tab}
        onChange={(key) => {
          setTab(key);
          setPage(0);
        }}
      />

      <div className="mt-6 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <MovieCardSkeleton key={i} />)
        ) : data?.content.length === 0 ? (
          <EmptyState icon={<Ticket className="h-16 w-16" />} title={t('tickets.noTickets')} />
        ) : (
          data?.content.map((booking) => (
            <div
              key={booking.id}
              className="bg-card rounded-xl border border-base-primary overflow-hidden shadow-theme-sm hover:shadow-theme-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                <img
                  src={booking.moviePosterUrl}
                  alt={booking.movieTitle}
                  className="w-20 h-28 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base-primary line-clamp-1">
                      {booking.movieTitle}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-success-50 text-success-700 dark:bg-green-900/30 dark:text-green-400'
                          : booking.status === 'CANCELLED'
                            ? 'bg-error-50 text-error-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-warning-50 text-warning-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {t(`tickets.status${booking.status}`)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-base-secondary">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> {booking.cinemaName} • {booking.roomName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> {formatDate(booking.showDate, language)}{' '}
                      • {formatTime(booking.showtime)} • {booking.format}
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-3.5 w-3.5" />{' '}
                      {booking.seats.map((s) => s.label).join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-primary-600">
                      {formatCurrency(booking.totalAmount, language)}
                    </span>
                    {canCancel(booking) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error-500 hover:text-error-600"
                        onClick={() => setCancelTarget(booking)}
                        leftIcon={<XCircle className="h-4 w-4" />}
                      >
                        {t('tickets.cancel')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-4 pb-3 text-xs text-base-tertiary">
                {t('booking.bookingCode')}: {booking.bookingCode}
                <Link className="ml-3 underline" to={`/booking/result/${booking.id}`}>
                  {t('tickets.ticketDetail')}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={data.size}
          onPageChange={setPage}
        />
      )}

      {/* Modal xác nhận hủy */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title={t('tickets.confirmCancel')}
      >
        <p className="text-base-secondary mb-4">{t('tickets.confirmCancelMsg')}</p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setCancelTarget(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            fullWidth
            isLoading={cancelMutation.isPending}
            onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
          >
            {t('tickets.cancel')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
