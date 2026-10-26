/**
 * Trang chọn ghế.
 * Sơ đồ ghế theo hàng A,B,C...; loại ghế thường/VIP/đôi;
 * trạng thái trống/đang chọn/đã đặt/đang giữ; tối đa 8 ghế;
 * hiện tổng tiền; chú thích màu; cuộn ngang trên điện thoại.
 */
import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getShowtimeApi } from '@/features/showtimes/api';
import { Monitor, X, ArrowLeft } from 'lucide-react';
import { useSeatMapRealtime } from '@/hooks/useSeatMapRealtime';
import { holdSeatsApi } from '../api';
import { useBookingStore } from '@/stores/bookingStore';
import { useLanguageStore } from '@/stores/languageStore';
import { formatCurrency, formatTime, formatDate } from '@/lib/format';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/common/ErrorState';
import { useToast } from '@/components/ui/Toast';
import type { Seat, ApiError } from '@/types';

const MAX_SEATS = 8;

/** Màu ghế theo loại và trạng thái */
const seatColors: Record<string, string> = {
  'AVAILABLE-STANDARD': 'bg-green-500 hover:bg-green-400',
  'AVAILABLE-VIP': 'bg-purple-500 hover:bg-purple-400',
  'AVAILABLE-COUPLE': 'bg-pink-500 hover:bg-pink-400',
  'SELECTED-STANDARD': 'bg-primary-500 ring-2 ring-primary-300',
  'SELECTED-VIP': 'bg-primary-500 ring-2 ring-primary-300',
  'SELECTED-COUPLE': 'bg-primary-500 ring-2 ring-primary-300',
  OCCUPIED: 'bg-gray-500 cursor-not-allowed opacity-50',
  HELD: 'bg-yellow-500 cursor-not-allowed opacity-70',
  AISLE: 'bg-transparent cursor-default',
};

/** Chú thích màu ghế */
function SeatLegend() {
  const { t } = useTranslation();
  const items = [
    { label: t('booking.available'), color: 'bg-green-500' },
    { label: t('booking.selected'), color: 'bg-primary-500' },
    { label: t('booking.occupied'), color: 'bg-gray-500 opacity-50' },
    { label: t('booking.held'), color: 'bg-yellow-500' },
    { label: t('booking.vip'), color: 'bg-purple-500' },
    { label: t('booking.couple'), color: 'bg-pink-500' },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs text-base-secondary">
          <div className={`w-5 h-5 rounded ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

export default function SeatSelectionPage() {
  const { showtimeId: stId } = useParams<{ showtimeId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { language } = useLanguageStore();
  const showtimeId = Number(stId);

  const {
    movieTitle,
    cinemaName,
    roomName,
    showDate,
    showTime,
    format: showFormat,
    selectedSeats,
    toggleSeat,
    setSelectedSeats,
    setHold,
    setShowtime,
    showtimeId: storeShowtimeId,
  } = useBookingStore();

  const showtime = useQuery({
    queryKey: ['showtime', showtimeId],
    queryFn: () => getShowtimeApi(showtimeId).then((r) => r.data),
    enabled: showtimeId > 0,
  });
  // Tải lại metadata từ API khi mở liên kết chọn ghế trực tiếp.
  useEffect(() => {
    if (showtime.data && storeShowtimeId !== showtimeId) {
      const data = showtime.data;
      setShowtime({
        showtimeId: data.id,
        movieTitle: data.movieTitle,
        cinemaName: data.cinemaName,
        roomName: data.roomName,
        showDate: data.date,
        showTime: formatTime(data.startTime),
        format: data.format,
      });
    }
  }, [storeShowtimeId, showtimeId, setShowtime, showtime.data]);

  const { data: seatMap, isLoading, error, refetch } = useSeatMapRealtime(showtimeId);

  const holdMutation = useMutation({
    mutationFn: () =>
      holdSeatsApi(
        showtimeId,
        selectedSeats.map((s) => s.id),
      ),
    onSuccess: (res) => {
      setHold(res.data.holdId, res.data.expiresAt);
      navigate(`/booking/${showtimeId}/combos`);
    },
    onError: (error: ApiError) => {
      addToast('error', error.message || t('common.error'));
      setSelectedSeats([]);
      void refetch();
    },
  });

  const handleSeatClick = useCallback(
    (seat: Seat) => {
      if (seat.status === 'OCCUPIED' || seat.status === 'HELD' || seat.type === 'AISLE') return;
      if (!selectedSeats.find((s) => s.id === seat.id) && selectedSeats.length >= MAX_SEATS) {
        addToast('warning', t('booking.maxSeatsReached', { max: MAX_SEATS }));
        return;
      }
      toggleSeat(seat);
    },
    [selectedSeats, toggleSeat, addToast, t],
  );

  const seatsTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  if (!Number.isFinite(showtimeId) || showtimeId <= 0 || showtime.isError)
    return <ErrorState onRetry={() => void showtime.refetch()} />;
  if (isLoading || showtime.isLoading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton variant="rectangular" className="h-96 rounded-xl" />
      </div>
    );

  if (error || !seatMap) return <ErrorState onRetry={() => void refetch()} />;

  // Nhóm ghế theo hàng
  const rows = new Map<string, Seat[]>();
  for (const seat of seatMap.seats) {
    if (!rows.has(seat.row)) rows.set(seat.row, []);
    rows.get(seat.row)!.push(seat);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
      <Button variant="outline" className="mb-4" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/movies/${showtime.data?.movieId}#showtimes`)}>{t('booking.backToShowtimes')}</Button>
      {/* Header */}
      <div className="bg-card rounded-xl border border-base-primary p-4 mb-6">
        <h1 className="text-lg font-bold text-base-primary">{movieTitle}</h1>
        <p className="text-sm text-base-secondary">
          {cinemaName} • {roomName} • {formatDate(showDate, language)} • {showTime} • {showFormat}
        </p>
      </div>

      {/* Sơ đồ ghế */}
      <div className="bg-card rounded-xl border border-base-primary p-4 overflow-x-auto">
        {/* Màn hình */}
        <div className="text-center mb-8">
          <div className="mx-auto w-3/4 h-2 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full mb-2" />
          <div className="flex items-center justify-center gap-2 text-xs text-base-tertiary">
            <Monitor className="h-4 w-4" />
            {t('booking.screen')}
          </div>
        </div>

        {/* Ghế */}
        <div
          className="flex flex-col items-center gap-1.5 min-w-fit mx-auto"
          role="grid"
          aria-label={t('booking.seatMap')}
        >
          {Array.from(rows.entries()).map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className="flex items-center gap-1.5" role="row">
              <span className="w-6 text-xs font-bold text-base-tertiary text-center">
                {rowLabel}
              </span>
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.some((s) => s.id === seat.id);
                const statusKey =
                  seat.type === 'AISLE'
                    ? 'AISLE'
                    : seat.status === 'OCCUPIED' || seat.status === 'HELD'
                      ? seat.status
                      : isSelected
                        ? `SELECTED-${seat.type}`
                        : `AVAILABLE-${seat.type}`;
                const colorClass = seatColors[statusKey] || seatColors['AVAILABLE-STANDARD'];
                const isCouple = seat.type === 'COUPLE';

                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={
                      seat.type === 'AISLE' || seat.status === 'OCCUPIED' || seat.status === 'HELD'
                    }
                    className={`${isCouple ? 'w-14' : 'w-7'} h-7 rounded-t-lg text-[10px] font-bold text-white transition-all duration-150 ${colorClass}`}
                    role="gridcell"
                    aria-label={`${seat.label} - ${t(`values.${seat.type}`)} - ${seat.status === 'OCCUPIED' ? t('booking.occupied') : seat.status === 'HELD' ? t('booking.held') : t('booking.available')}`}
                    aria-selected={isSelected}
                    title={`${seat.label} (${formatCurrency(seat.price, language)})`}
                  >
                    {seat.type !== 'AISLE' && seat.column}
                  </button>
                );
              })}
              <span className="w-6 text-xs font-bold text-base-tertiary text-center">
                {rowLabel}
              </span>
            </div>
          ))}
        </div>

        <SeatLegend />
        <p className="text-center text-xs text-base-tertiary mt-2">
          {t('booking.maxSeats', { max: MAX_SEATS })}
        </p>
      </div>

      {/* Panel ghế đã chọn */}
      <div className="bg-card rounded-xl border border-base-primary p-4 mt-4">
        <h3 className="font-semibold text-base-primary mb-3">{t('booking.selectedSeats')}</h3>
        {selectedSeats.length === 0 ? (
          <p className="text-sm text-base-tertiary">{t('booking.noSeatsSelected')}</p>
        ) : (
          <div className="space-y-2">
            {selectedSeats.map((seat) => (
              <div key={seat.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-base-primary">{seat.label}</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded text-base-secondary">
                    {t(`values.${seat.type}`)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base-secondary">
                    {formatCurrency(seat.price, language)}
                  </span>
                  <button
                    onClick={() => toggleSeat(seat)}
                    className="text-base-tertiary hover:text-error-500 transition-colors"
                    aria-label={t('common.remove')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t border-base-primary pt-2 flex justify-between items-center font-semibold">
              <span className="text-base-primary">{t('common.total')}</span>
              <span className="text-primary-600 text-lg">
                {formatCurrency(seatsTotal, language)}
              </span>
            </div>
          </div>
        )}
        <Button
          className="mt-4"
          fullWidth
          size="lg"
          disabled={selectedSeats.length === 0}
          isLoading={holdMutation.isPending}
          onClick={() => holdMutation.mutate()}
        >
          {t('booking.continueToHold')}
        </Button>
      </div>
    </div>
  );
}
