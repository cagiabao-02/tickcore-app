/** Chờ xác nhận thanh toán; QR thanh toán mô phỏng khác QR vé và không xác nhận nhận tiền thật. */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Clock } from 'lucide-react';
import type { ApiError, Booking, PaymentMethod, PaymentOutcome, PaymentSimulation } from '@/types';
import { simulatePaymentApi } from '../api';
import { useCountdown } from '@/hooks/useCountdown';
import { formatCurrency } from '@/lib/format';
import { useLanguageStore } from '@/stores/languageStore';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface PaymentDialogProps {
  booking: Booking;
  method: PaymentMethod;
  onClose: () => void;
  onComplete: (booking: Booking) => void;
  onExpired: () => void;
}

export default function PaymentDialog({
  booking,
  method,
  onClose,
  onComplete,
  onExpired,
}: PaymentDialogProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const client = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState(method);
  const expirationHandled = useRef(false);
  const countdown = useCountdown(booking.expiresAt || null);
  const payment = useMutation<PaymentSimulation, ApiError, PaymentOutcome>({
    mutationFn: (outcome: PaymentOutcome) =>
      simulatePaymentApi(booking.id, selectedMethod, outcome).then((response) => response.data),
    onSuccess: (data) => {
      void client.invalidateQueries();
      onComplete(data.booking);
    },
  });
  useEffect(() => {
    if (countdown.isExpired && !payment.isPending && !expirationHandled.current) {
      expirationHandled.current = true;
      onExpired();
    }
  }, [countdown.isExpired, payment.isPending, onExpired]);
  const close = () => {
    if (!payment.isPending) onClose();
  };
  return (
    <Modal
      isOpen
      onClose={close}
      title={t('booking.awaitingPayment')}
      size="lg"
      showCloseButton={!payment.isPending}
    >
      <div className="space-y-4">
        <p className="text-sm text-base-secondary">{t('booking.paymentPendingHint')}</p>
        <p className="font-mono">
          {t('booking.bookingCode')}: {booking.bookingCode}
        </p>
        <p className="text-2xl font-bold text-primary-600">
          {formatCurrency(booking.totalAmount, language)}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t('booking.holdExpires')}: {countdown.display}
        </p>
        <Select
          label={t('booking.paymentMethod')}
          value={selectedMethod}
          disabled={payment.isPending}
          onChange={(event) => setSelectedMethod(event.target.value as PaymentMethod)}
          options={[
            { value: 'CREDIT_CARD', label: t('booking.creditCard') },
            { value: 'E_WALLET', label: t('booking.eWallet') },
            { value: 'QR_TRANSFER', label: t('booking.qrTransfer') },
          ]}
        />
        {selectedMethod === 'QR_TRANSFER' && (
          <div className="text-center space-y-2">
            <div className="inline-block p-4 rounded-xl bg-white">
              <QRCodeSVG
                role="img"
                title={t('booking.paymentQr')}
                value={`MOCK_PAYMENT:${booking.id}:${booking.totalAmount}:${selectedMethod}`}
                size={180}
              />
            </div>
            <p className="font-medium">{t('booking.paymentQr')}</p>
          </div>
        )}
        <div className="border border-base-primary rounded-xl p-4 bg-secondary space-y-3">
          <p className="font-semibold">{t('booking.simulationMode')}</p>
          <p className="text-sm text-base-secondary">{t('booking.simulationOnlyHint')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              fullWidth
              disabled={countdown.isExpired}
              isLoading={payment.isPending}
              onClick={() => payment.mutate('SUCCESS')}
            >
              {t('booking.simulateSuccess')}
            </Button>
            <Button
              variant="outline"
              fullWidth
              disabled={countdown.isExpired || payment.isPending}
              onClick={() => payment.mutate('FAILED')}
            >
              {t('booking.simulateFailure')}
            </Button>
          </div>
        </div>
        {payment.isError && (
          <p role="alert" className="text-error-600">
            {payment.error.message || t('common.error')}
          </p>
        )}
      </div>
    </Modal>
  );
}
