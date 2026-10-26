/**
 * Trang chọn combo bắp nước.
 * Danh sách combo có ảnh, mô tả, giá; tăng giảm số lượng; có thể bỏ qua.
 * Hiện đồng hồ giữ ghế.
 */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Plus, Minus, Timer } from 'lucide-react';
import { listCombosApi, releaseHoldApi } from '../api';
import { useBookingStore } from '@/stores/bookingStore';
import type { Combo } from '@/types';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguageStore } from '@/stores/languageStore';
import { formatCurrency } from '@/lib/format';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useState } from 'react';
import BookingBackButton from '../components/BookingBackButton';

export default function CombosPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  const {
    holdId,
    holdExpiresAt,
    selectedCombos,
    updateComboQuantity,
    setSelectedCombos,
    clearHold,
    movieTitle,
    setSelectedSeats,
  } = useBookingStore();

  const countdown = useCountdown(holdExpiresAt);

  // Chỉ kiểm tra lúc vào trang; khi nhả hold, giữ điều hướng do modal/guard đã chọn.
  useEffect(() => {
    if (!useBookingStore.getState().holdId) navigate('/', { replace: true });
  }, [navigate]);

  // Hết giờ giữ ghế
  useEffect(() => {
    if (countdown.isExpired && holdId) {
      setShowExpiredModal(true);
      void releaseHoldApi(holdId).catch(() => undefined);
    }
  }, [countdown.isExpired, holdId]);

  const {
    data: combos,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['combos'],
    queryFn: () => listCombosApi().then((r) => r.data),
  });

  const handleAddCombo = (combo: Combo) => {
    const existing = selectedCombos.find((c) => c.combo.id === combo.id);
    if (existing) {
      updateComboQuantity(combo.id, existing.quantity + 1);
    } else {
      setSelectedCombos([...selectedCombos, { combo, quantity: 1 }]);
    }
  };

  const getQuantity = (comboId: number) =>
    selectedCombos.find((c) => c.combo.id === comboId)?.quantity || 0;
  const combosTotal = selectedCombos.reduce((s, c) => s + c.combo.price * c.quantity, 0);

  const handleExpiredClose = () => {
    setShowExpiredModal(false);
    clearHold();
    setSelectedSeats([]);
    navigate(`/booking/${showtimeId}/seats`, { replace: true });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Đồng hồ giữ ghế */}
      {holdExpiresAt && !countdown.isExpired && (
        <div
          className={`sticky top-16 z-30 flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-4 font-mono text-lg font-bold ${countdown.seconds <= 60 ? 'bg-error-50 text-error-600' : 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400'}`}
        >
          <Timer className="h-5 w-5" />
          {t('booking.holdExpires')}: {countdown.display}
        </div>
      )}

      <BookingBackButton step="seats" />
      <h1 className="text-2xl font-bold text-base-primary mb-2">{t('booking.combos')}</h1>
      <p className="text-sm text-base-secondary mb-6">{movieTitle}</p>

      {error ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : combos?.length === 0 ? (
        <EmptyState title={t('booking.noCombos')} />
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {combos?.map((combo) => {
            const qty = getQuantity(combo.id);
            return (
              <div
                key={combo.id}
                className="bg-card rounded-xl border border-base-primary p-4 flex gap-4"
              >
                <img
                  src={combo.imageUrl}
                  alt={combo.name}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base-primary">{combo.name}</h3>
                  <p className="text-sm text-base-secondary mt-1">{combo.description}</p>
                  <p className="text-lg font-bold text-primary-600 mt-2">
                    {formatCurrency(combo.price, language)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {qty > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={`${t('common.remove')} ${combo.name}`}
                        onClick={() => updateComboQuantity(combo.id, qty - 1)}
                        className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-base-secondary hover:bg-tertiary transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-base-primary">{qty}</span>
                      <button
                        aria-label={`${t('common.create')} ${combo.name}`}
                        onClick={() => updateComboQuantity(combo.id, qty + 1)}
                        className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddCombo(combo)}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      {t('common.create')}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tổng và nút tiếp */}
      <div className="mt-6 bg-card rounded-xl border border-base-primary p-4">
        {combosTotal > 0 && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-base-secondary">{t('booking.combosInfo')}</span>
            <span className="font-semibold text-primary-600">
              {formatCurrency(combosTotal, language)}
            </span>
          </div>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            disabled={countdown.isExpired}
            onClick={() => {
              setSelectedCombos([]);
              navigate(`/booking/${showtimeId}/checkout`);
            }}
          >
            {t('booking.skipCombos')}
          </Button>
          <Button
            fullWidth
            disabled={countdown.isExpired}
            onClick={() => navigate(`/booking/${showtimeId}/checkout`)}
          >
            {t('common.next')}
          </Button>
        </div>
      </div>

      {/* Modal hết giờ */}
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
