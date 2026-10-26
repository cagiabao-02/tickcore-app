/** Xác nhận rời luồng đặt vé và nhả ghế; giữ nguyên hold khi đi giữa combo và thanh toán. */
import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useBookingStore } from '@/stores/bookingStore';
import { releaseBookingSession, ensureEditableHold } from '../lib/bookingSession';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function BookingLeaveGuard() {
  const { t } = useTranslation();
  const { holdId } = useBookingStore();
  const blocker = useBlocker(({ nextLocation }) => {
    const state = useBookingStore.getState();
    return (
      !!state.holdId &&
      ![...(state.pendingBookingId ? [] : [`/booking/${state.showtimeId}/combos`]), `/booking/${state.showtimeId}/checkout`].includes(
        nextLocation.pathname,
      )
    );
  });
  const release = useMutation({
    mutationFn: async () => {
      const state = useBookingStore.getState();
      if (blocker.state === 'blocked' && blocker.location.pathname === `/booking/${state.showtimeId}/combos`) await ensureEditableHold();
      else await releaseBookingSession();
    },
    onSuccess: () => {
      if (blocker.state === 'blocked') blocker.proceed();
    },
  });
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (holdId) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [holdId]);
  return (
    <Modal
      isOpen={blocker.state === 'blocked'}
      onClose={() => blocker.state === 'blocked' && blocker.reset()}
      title={t('booking.holdTitle')}
    >
      <p>{t('booking.holdConfirmLeave')}</p>
      {release.isError && <p role="alert">{t('common.error')}</p>}
      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={() => blocker.state === 'blocked' && blocker.reset()}>
          {t('common.cancel')}
        </Button>
        <Button isLoading={release.isPending} onClick={() => release.mutate()}>
          {t('common.confirm')}
        </Button>
      </div>
    </Modal>
  );
}
