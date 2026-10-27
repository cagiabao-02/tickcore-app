/** Quét mã QR bằng máy quét dạng bàn phím và xác nhận lượt vào rạp. */
import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ScanLine, XCircle } from 'lucide-react';
import { adminCheckInBookingApi } from '../api';
import type { ApiError, Booking } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDate, formatTime } from '@/lib/format';
import { useLanguageStore } from '@/stores/languageStore';

export default function AdminTicketScanPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [ticketCode, setTicketCode] = useState('');
  const [result, setResult] = useState<Booking | null>(null);
  const [scanError, setScanError] = useState('');
  const scan = useMutation<Booking, ApiError, string>({
    mutationFn: (code) => adminCheckInBookingApi(code).then((response) => response.data),
    onSuccess: (booking) => {
      setResult(booking);
      setScanError('');
      setTicketCode('');
      inputRef.current?.focus();
    },
    onError: (error) => {
      setResult(null);
      const previousScan = error.details?.checkedInAt;
      const previousScanner = error.details?.checkedInBy;
      setScanError(
        error.code === 'TICKET_ALREADY_CHECKED_IN' && previousScan
          ? t('tickets.alreadyCheckedIn', {
              time: new Date(previousScan).toLocaleString(),
              scanner: previousScanner || t('tickets.unknownScanner'),
            })
          : error.message || t('tickets.scanInvalid'),
      );
      setTicketCode('');
      inputRef.current?.focus();
    },
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = ticketCode.trim();
    if (!code || scan.isPending) return;
    setResult(null);
    setScanError('');
    scan.mutate(code);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-base-primary">{t('admin.ticketScan')}</h1>
        <p className="mt-2 text-base-secondary">{t('tickets.scannerInstructions')}</p>
      </header>

      <form
        onSubmit={submit}
        className="bg-card border border-base-primary rounded-xl p-5 space-y-4"
      >
        <Input
          ref={inputRef}
          label={t('tickets.bookingCodeToScan')}
          value={ticketCode}
          onChange={(event) => setTicketCode(event.target.value)}
          placeholder="TC20261026001"
          autoComplete="off"
          autoFocus
          leftIcon={<ScanLine className="h-4 w-4" />}
        />
        <Button type="submit" disabled={!ticketCode.trim()} isLoading={scan.isPending}>
          {t('tickets.verifyAndCheckIn')}
        </Button>
      </form>

      {result && (
        <section
          role="status"
          className="rounded-xl border border-success-500 bg-success-50 dark:bg-green-950/30 p-5 space-y-3"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-success-700 dark:text-success-400">
            <CheckCircle2 className="h-6 w-6" /> {t('tickets.checkInSuccess')}
          </h2>
          <p className="font-mono font-bold text-base-primary">{result.bookingCode}</p>
          <p className="text-base-primary">{result.movieTitle}</p>
          <p className="text-sm text-base-secondary">
            {result.cinemaName} · {result.roomName} · {formatDate(result.showDate, language)} ·{' '}
            {formatTime(result.showtime)}
          </p>
          <p className="text-sm text-base-secondary">
            {t('booking.seatsInfo')}: {result.seats.map((seat) => seat.label).join(', ')}
          </p>
          <p className="text-sm text-base-secondary">
            {t('tickets.checkedInAt')}:{' '}
            {result.checkedInAt ? new Date(result.checkedInAt).toLocaleString() : '—'}
          </p>
          {result.checkedInBy && (
            <p className="text-sm text-base-secondary">
              {t('tickets.checkedInBy')}: {result.checkedInBy}
            </p>
          )}
        </section>
      )}

      {scanError && (
        <section
          role="alert"
          className="rounded-xl border border-error-500 bg-error-50 dark:bg-red-950/30 p-5"
        >
          <h2 className="flex items-center gap-2 font-bold text-error-700 dark:text-error-400">
            <XCircle className="h-5 w-5" /> {t('tickets.checkInRejected')}
          </h2>
          <p className="mt-2 text-sm text-base-primary">{scanError}</p>
        </section>
      )}
    </div>
  );
}
