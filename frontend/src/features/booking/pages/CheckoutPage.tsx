/**
 * Trang tóm tắt đơn và thanh toán mô phỏng.
 * Tóm tắt phim, rạp, phòng, giờ, ghế, combo, giảm giá, tổng tiền;
 * chọn phương thức; mã giảm giá; nút thanh toán; đồng hồ giữ ghế.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Timer, CreditCard, Wallet, QrCode, Tag, X } from 'lucide-react';
import { createBookingApi, validatePromoApi, releaseHoldApi } from '../api';
import { getBookingDetailApi } from '@/features/tickets/api';
import PaymentDialog from '@/features/payment/components/PaymentDialog';
import BookingBackButton from '../components/BookingBackButton';
import { useBookingStore } from '@/stores/bookingStore';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguageStore } from '@/stores/languageStore';
import { formatCurrency, formatDate } from '@/lib/format';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { PaymentMethod, Booking, ApiError } from '@/types';

const paymentMethods: { key: PaymentMethod; icon: typeof CreditCard; labelKey: string }[] = [
  { key: 'CREDIT_CARD', icon: CreditCard, labelKey: 'booking.creditCard' },
  { key: 'E_WALLET', icon: Wallet, labelKey: 'booking.eWallet' },
  { key: 'QR_TRANSFER', icon: QrCode, labelKey: 'booking.qrTransfer' },
];

export default function CheckoutPage() {
  const { showtimeId: stId } = useParams<{ showtimeId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { language } = useLanguageStore();
  const showtimeId = Number(stId);

  const {
    holdId,
    holdExpiresAt,
    movieTitle,
    cinemaName,
    roomName,
    showDate,
    showTime,
    format: showFormat,
    selectedSeats,
    selectedCombos,
    promoCode,
    discountAmount,
    setPromoCode,
    getSeatsTotal,
    getCombosTotal,
    getGrandTotal,
    clearHold,
    reset,
    setSelectedSeats,
    pendingBookingId, setPendingBookingId,
  } = useBookingStore();

  const countdown = useCountdown(holdExpiresAt);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [promoInput, setPromoInput] = useState(promoCode || '');
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);

  // Không điều hướng lại khi hoàn tất, hết hạn hoặc xác nhận nhả hold để rời luồng.
  useEffect(() => {
    if (!useBookingStore.getState().holdId) navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (countdown.isExpired && holdId) {
      setShowExpiredModal(true);
      void releaseHoldApi(holdId).catch(() => undefined);
    }
  }, [countdown.isExpired, holdId]);

  // Kiểm tra mã giảm giá
  const promoMutation = useMutation({
    mutationFn: () =>
      validatePromoApi(promoInput, getSeatsTotal() + getCombosTotal()).then((r) => r.data),
    onSuccess: (data) => {
      if (data.valid) {
        setPromoCode(promoInput, data.discountAmount);
        addToast(
          'success',
          t('booking.promoSuccess', { amount: formatCurrency(data.discountAmount, language) }),
        );
      } else {
        addToast(
          'error',
          t(data.message, { amount: formatCurrency(data.minOrderAmount || 0, language) }),
        );
      }
    },
  });

  // Chỉ tạo đơn PENDING; mở bước chờ, chưa gọi API xác nhận thanh toán.
  const payMutation = useMutation({
    mutationFn: async () => {
      if (pendingBookingId) return getBookingDetailApi(pendingBookingId).then((response) => response.data);
      return createBookingApi({
          holdId: holdId!,
          showtimeId,
          combos: selectedCombos.map((c) => ({ comboId: c.combo.id, quantity: c.quantity })),
          promoCode: promoCode,
        }).then((response) => response.data);
    },
    onSuccess: (data) => {
      if (data.status !== 'PENDING') { reset(); navigate(`/booking/result/${data.id}`); return; }
      setPendingBookingId(data.id);
      setPaymentBooking(data);
    },
    onError: (error: ApiError) => {
      addToast('error', error.message || t('errors.serverError'));
    },
  });

  const handleRemovePromo = () => {
    setPromoCode(null, 0);
    setPromoInput('');
  };

  const handleExpiredClose = () => {
    setShowExpiredModal(false);
    clearHold();
    setSelectedSeats([]);
    navigate(`/booking/${showtimeId}/seats`, { replace: true });
  };

  // Prompt khi rời trang
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (holdId) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [holdId]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Đồng hồ */}
      {holdExpiresAt && !countdown.isExpired && (
        <div
          data-testid="hold-countdown-mobile"
          className={`lg:hidden sticky top-16 z-30 flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-4 font-mono text-lg font-bold ${countdown.seconds <= 60 ? 'bg-error-50 text-error-600' : 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400'}`}
        >
          <Timer className="h-5 w-5" /> {t('booking.holdExpires')}: {countdown.display}
        </div>
      )}

      <h1 className="text-2xl font-bold text-base-primary mb-6">{t('booking.checkout')}</h1>
      <BookingBackButton step="combos" disabled={payMutation.isPending} />
      {pendingBookingId && <p className="text-sm text-base-secondary mb-4">{t('booking.pendingEditsHint')}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tóm tắt đơn */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-base-primary p-4">
            <h3 className="font-semibold text-base-primary mb-3">{t('booking.movieInfo')}</h3>
            <p className="font-medium text-base-primary">{movieTitle}</p>
            <p className="text-sm text-base-secondary">
              {cinemaName} • {roomName}
            </p>
            <p className="text-sm text-base-secondary">
              {formatDate(showDate, language)} • {showTime} • {showFormat}
            </p>
          </div>

          <div className="bg-card rounded-xl border border-base-primary p-4">
            <h3 className="font-semibold text-base-primary mb-3">{t('booking.seatsInfo')}</h3>
            {selectedSeats.map((s) => (
              <div key={s.id} className="flex justify-between text-sm py-1">
                <span className="text-base-primary">
                  {s.label}{' '}
                  <span className="text-xs text-base-tertiary">({t(`values.${s.type}`)})</span>
                </span>
                <span className="text-base-secondary">{formatCurrency(s.price, language)}</span>
              </div>
            ))}
          </div>

          {selectedCombos.length > 0 && (
            <div className="bg-card rounded-xl border border-base-primary p-4">
              <h3 className="font-semibold text-base-primary mb-3">{t('booking.combosInfo')}</h3>
              {selectedCombos.map((c) => (
                <div key={c.combo.id} className="flex justify-between text-sm py-1">
                  <span className="text-base-primary">
                    {c.combo.name} x{c.quantity}
                  </span>
                  <span className="text-base-secondary">
                    {formatCurrency(c.combo.price * c.quantity, language)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Mã giảm giá */}
          <div className="bg-card rounded-xl border border-base-primary p-4">
            <h3 className="font-semibold text-base-primary mb-3">{t('booking.promoCode')}</h3>
            {promoCode ? (
              <div className="flex items-center justify-between bg-success-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-success-600" />
                  <span className="text-sm font-medium text-success-600">
                    {promoCode}: -{formatCurrency(discountAmount, language)}
                  </span>
                </div>
                <button
                  disabled={!!pendingBookingId}
                  aria-label={t('booking.promoRemove')}
                  onClick={handleRemovePromo}
                  className="text-base-tertiary hover:text-error-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  disabled={!!pendingBookingId}
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={t('booking.promoPlaceholder')}
                />
                <Button
                  variant="outline"
                  onClick={() => promoMutation.mutate()}
                  isLoading={promoMutation.isPending}
                  disabled={!promoInput.trim() || !!pendingBookingId}
                >
                  {t('booking.promoApply')}
                </Button>
              </div>
            )}
          </div>

          {/* Phương thức thanh toán */}
          <div className="bg-card rounded-xl border border-base-primary p-4">
            <h3 className="font-semibold text-base-primary mb-3">{t('booking.paymentMethod')}</h3>
            <p className="text-sm text-base-secondary mb-3">{t('booking.simulationHint')}</p>
            <div className="space-y-2">
              {paymentMethods.map(({ key, icon: Icon, labelKey }) => (
                <button
                  key={key}
                  disabled={!!pendingBookingId}
                  onClick={() => setSelectedMethod(key)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all ${
                    selectedMethod === key
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                      : 'border-base-primary hover:bg-secondary'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${selectedMethod === key ? 'text-primary-600' : 'text-base-tertiary'}`}
                  />
                  <span
                    className={`text-sm font-medium ${selectedMethod === key ? 'text-primary-700 dark:text-primary-400' : 'text-base-secondary'}`}
                  >
                    {t(labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="lg:col-span-1">
          <div data-testid="order-summary" className="bg-card rounded-xl border border-base-primary p-4 lg:sticky lg:top-20">
            {holdExpiresAt && !countdown.isExpired && <div data-testid="hold-countdown-desktop" className="hidden lg:flex flex-col gap-1 p-3 rounded-lg bg-secondary mb-4 font-mono text-sm font-semibold"><span>{t('booking.holdExpires')}</span><span className="flex items-center gap-2"><Timer className="h-4 w-4" />{countdown.display}</span></div>}
            <h3 className="font-semibold text-base-primary mb-4">{t('booking.orderSummary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-base-secondary">{t('booking.seatsInfo')}</span>
                <span>{formatCurrency(getSeatsTotal(), language)}</span>
              </div>
              {getCombosTotal() > 0 && (
                <div className="flex justify-between">
                  <span className="text-base-secondary">{t('booking.combosInfo')}</span>
                  <span>{formatCurrency(getCombosTotal(), language)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-base-secondary">{t('common.subtotal')}</span>
                <span>{formatCurrency(getSeatsTotal() + getCombosTotal(), language)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>{t('common.discount')}</span>
                  <span>-{formatCurrency(discountAmount, language)}</span>
                </div>
              )}
              <div className="border-t border-base-primary pt-2 flex justify-between font-bold text-lg">
                <span className="text-base-primary">{t('common.total')}</span>
                <span className="text-primary-600">
                  {formatCurrency(getGrandTotal(), language)}
                </span>
              </div>
            </div>
            <Button
              fullWidth
              size="lg"
              className="mt-6"
              disabled={countdown.isExpired || !holdId}
              isLoading={payMutation.isPending}
              onClick={() => payMutation.mutate()}
            >
              {payMutation.isPending ? t('booking.processing') : t(pendingBookingId ? 'booking.continuePayment' : 'booking.proceedPayment')}
            </Button>
          </div>
        </div>
      </div>

      {paymentBooking && <PaymentDialog booking={paymentBooking} method={selectedMethod} onClose={() => setPaymentBooking(null)} onComplete={(booking) => { setPaymentBooking(null); reset(); navigate(`/booking/result/${booking.id}`); }} onExpired={() => { setPaymentBooking(null); setShowExpiredModal(true); }} />}

      <Modal
        isOpen={showExpiredModal}
        onClose={handleExpiredClose}
        title={t('booking.holdExpired')}
      >
        <p className="text-base-secondary mb-4">{t('booking.holdExpiredMessage')}</p>
        <Button fullWidth onClick={handleExpiredClose}>
          {t('common.confirm')}
        </Button>
      </Modal>
    </div>
  );
}
