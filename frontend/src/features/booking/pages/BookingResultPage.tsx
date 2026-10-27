/**
 * Trang kết quả đặt vé (thành công / thất bại).
 * Hiện mã QR, chi tiết đơn, nút xem vé của tôi / quay trang chủ.
 */
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Home, Ticket, Clock, ScanLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getBookingDetailApi } from '@/features/tickets/api';
import PaymentDialog from '@/features/payment/components/PaymentDialog';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { useLanguageStore } from '@/stores/languageStore';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/common/ErrorState';

export default function BookingResultPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const client = useQueryClient();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const {
    data: booking,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingDetailApi(Number(bookingId)).then((r) => r.data),
    enabled: !!bookingId,
  });

  if (isLoading)
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <Skeleton variant="circular" className="w-20 h-20 mx-auto mb-4" />
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-4 w-64 mx-auto" count={3} />
      </div>
    );

  if (error || !booking) return <ErrorState onRetry={() => void refetch()} />;

  const isSuccess = booking.status === 'CONFIRMED' && booking.paymentStatus === 'SUCCESS';
  const isPending = booking.status === 'PENDING' && booking.paymentStatus === 'PENDING';

  return (
    <div className="max-w-lg mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-card rounded-2xl border border-base-primary overflow-hidden shadow-theme-lg">
        {/* Status header */}
        <div
          className={`py-8 px-6 text-center ${isSuccess ? 'bg-gradient-to-b from-success-50 to-transparent dark:from-green-900/20' : 'bg-gradient-to-b from-error-50 to-transparent dark:from-red-900/20'}`}
        >
          {isSuccess ? (
            <CheckCircle className="h-20 w-20 text-success-500 mx-auto mb-4" />
          ) : isPending ? (
            <Clock className="h-20 w-20 text-primary-500 mx-auto mb-4" />
          ) : (
            <XCircle className="h-20 w-20 text-error-500 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-base-primary">
            {isSuccess
              ? t('booking.bookingSuccess')
              : isPending
                ? t('booking.awaitingPayment')
                : booking.status === 'CANCELLED'
                  ? t('tickets.statusCANCELLED')
                  : t('booking.bookingFailed')}
          </h1>
          <p className="text-sm text-base-secondary mt-2">
            {t('booking.bookingCode')}: <span className="font-bold">{booking.bookingCode}</span>
          </p>
        </div>

        {/* QR Code */}
        {isSuccess && (
          <div className="px-6 py-6 text-center">
            <p className="mb-2 flex items-center justify-center gap-2 font-semibold text-base-primary">
              <ScanLine className="h-5 w-5 text-primary-500" />
              {t('tickets.checkInQr')}
            </p>
            <p className="mb-4 text-sm text-base-secondary">{t('tickets.checkInQrHint')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {booking.seats.map((seat) => (
                <div key={seat.label} className="rounded-xl bg-secondary p-3">
                  <p className="mb-2 text-sm font-semibold text-base-primary">{seat.label}</p>
                  <div className="inline-block rounded-lg bg-white p-3 shadow-sm">
                    <QRCodeSVG
                      role="img"
                      title={`${t('tickets.checkInQr')} ${seat.label}`}
                      value={seat.ticketCode || booking.qrCode || booking.bookingCode}
                      size={144}
                    />
                  </div>
                  {seat.checkedInAt && (
                    <p className="mt-2 text-xs text-success-600">
                      {t('tickets.checkInSuccess')}: {new Date(seat.checkedInAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chi tiết */}
        <div className="px-6 pb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-base-secondary">{t('booking.movieInfo')}</span>
            <span className="font-medium text-base-primary text-right">{booking.movieTitle}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-secondary">{t('common.cinema')}</span>
            <span className="text-base-primary">{booking.cinemaName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-secondary">{t('common.room')}</span>
            <span className="text-base-primary">{booking.roomName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-secondary">{t('common.date')}</span>
            <span className="text-base-primary">
              {formatDate(booking.showDate, language)} • {formatTime(booking.showtime)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-secondary">{t('common.format')}</span>
            <span className="text-base-primary">{booking.format}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-secondary">{t('booking.seatsInfo')}</span>
            <span className="text-base-primary font-medium">
              {booking.seats.map((s) => s.label).join(', ')}
            </span>
          </div>
          {booking.combos.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-base-secondary">{t('booking.combosInfo')}</span>
              <span className="text-base-primary">
                {booking.combos.map((c) => `${c.name} x${c.quantity}`).join(', ')}
              </span>
            </div>
          )}
          <div className="border-t border-base-primary pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-base-secondary">{t('common.subtotal')}</span>
              <span>{formatCurrency(booking.subtotal, language)}</span>
            </div>
            {booking.discount > 0 && (
              <div className="flex justify-between text-sm text-success-600">
                <span>{t('common.discount')}</span>
                <span>-{formatCurrency(booking.discount, language)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span className="text-base-primary">{t('common.total')}</span>
              <span className="text-primary-600">
                {formatCurrency(booking.totalAmount, language)}
              </span>
            </div>
          </div>
        </div>

        {booking.checkedInAt && (
          <div className="mx-6 mb-5 rounded-lg bg-success-50 dark:bg-green-950/30 px-3 py-2 text-sm text-success-700 dark:text-success-400">
            {t('tickets.checkInSuccess')} · {new Date(booking.checkedInAt).toLocaleString()}
          </div>
        )}

        {/* Hành động */}
        {!isSuccess && (
          <div className="px-6 pb-4 space-y-2">
            <p role="alert">
              {t(
                booking.status === 'EXPIRED'
                  ? 'booking.holdExpiredMessage'
                  : booking.status === 'CANCELLED'
                    ? 'tickets.statusCANCELLED'
                    : isPending
                      ? 'booking.paymentPendingHint'
                      : 'booking.paymentFailureReason',
              )}
            </p>
            {booking.status === 'PENDING' && (
              <Button onClick={() => setPaymentOpen(true)}>
                {t(isPending ? 'booking.continuePayment' : 'booking.tryAgain')}
              </Button>
            )}
          </div>
        )}
        <div className="px-6 pb-6 flex gap-3">
          <Link to="/" className="flex-1">
            <Button variant="outline" fullWidth leftIcon={<Home className="h-4 w-4" />}>
              {t('nav.home')}
            </Button>
          </Link>
          <Link to="/tickets" className="flex-1">
            <Button fullWidth leftIcon={<Ticket className="h-4 w-4" />}>
              {t('nav.myTickets')}
            </Button>
          </Link>
        </div>
      </div>
      {paymentOpen && (
        <PaymentDialog
          booking={booking}
          method={booking.paymentMethod || 'QR_TRANSFER'}
          onClose={() => setPaymentOpen(false)}
          onComplete={(updated) => {
            client.setQueryData(['booking', bookingId], updated);
            setPaymentOpen(false);
          }}
          onExpired={() => {
            setPaymentOpen(false);
            void refetch();
          }}
        />
      )}
    </div>
  );
}
