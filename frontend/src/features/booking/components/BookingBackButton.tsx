/** Quay lại bước trước; sửa ghế thì nhả hold, sửa đơn chờ thì hủy và kiểm tra giữ ghế lại. */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useBookingStore } from '@/stores/bookingStore';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import { ensureEditableHold, releaseBookingSession } from '../lib/bookingSession';
import type { ApiError } from '@/types';

export default function BookingBackButton({
  step,
  disabled = false,
}: {
  step: 'seats' | 'combos';
  disabled?: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const client = useQueryClient();
  const { addToast } = useToast();
  const back = useMutation({
    mutationFn: () => (step === 'seats' ? releaseBookingSession() : ensureEditableHold()),
    onSuccess: () => {
      const id = useBookingStore.getState().showtimeId;
      void client.invalidateQueries({ queryKey: ['seatMap', id] });
      navigate(`/booking/${id}/${step}`);
    },
    onError: (error: ApiError) => {
      addToast('error', error.message || t('common.error'));
      if (!useBookingStore.getState().holdId) {
        useBookingStore.getState().setSelectedSeats([]);
        navigate(`/booking/${useBookingStore.getState().showtimeId}/seats`);
      }
    },
  });
  return (
    <div className="mb-4 space-y-1">
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => back.mutate()}
        isLoading={back.isPending}
        leftIcon={<ArrowLeft className="h-4 w-4" />}
      >
        {t(step === 'seats' ? 'booking.backToSeats' : 'booking.backToCombos')}
      </Button>
      {step === 'seats' && (
        <p className="text-xs text-base-secondary">{t('booking.backSeatsHint')}</p>
      )}
    </div>
  );
}
