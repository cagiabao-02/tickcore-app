/** Lịch chọn ngày tùy biến, mở về mép phải của ô chọn ngày. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

const parseDate = (value: string) => (value ? parseISO(value) : null);

export default function DatePicker({ label, value, onChange, min, max }: DatePickerProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = parseDate(value);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selected || new Date()));
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const days = useMemo(() => {
    const first = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, index) => addDays(first, index));
  }, [visibleMonth]);
  const weekdays = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(addDays(monday, index)),
    );
  }, [locale]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openCalendar = () => {
    setVisibleMonth(startOfMonth(selected || new Date()));
    setOpen((current) => !current);
  };
  const selectDate = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setOpen(false);
  };
  const isUnavailable = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    return (!!min && key < min) || (!!max && key > max);
  };

  return (
    <div ref={rootRef} className="relative min-w-[13rem] flex-1">
      <span className="block text-sm font-medium text-base-primary mb-1.5">{label}</span>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openCalendar}
        className="w-full flex items-center justify-between gap-3 rounded-lg border border-base-primary bg-card px-3 py-2.5 text-left text-sm text-base-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className={value ? '' : 'text-base-tertiary'}>
          {selected
            ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(selected)
            : t('common.selectDate')}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-base-tertiary" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 top-full z-50 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-base-primary bg-card p-3 shadow-theme-lg"
        >
          <div className="flex items-center justify-between gap-2 pb-3">
            <button
              type="button"
              aria-label={t('common.previousMonth')}
              onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
              className="rounded-lg p-2 text-base-secondary hover:bg-secondary hover:text-base-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="font-semibold text-base-primary">
              {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
                visibleMonth,
              )}
            </h2>
            <button
              type="button"
              aria-label={t('common.nextMonth')}
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
              className="rounded-lg p-2 text-base-secondary hover:bg-secondary hover:text-base-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center">
            {weekdays.map((day, index) => (
              <span
                key={`${day}-${index}`}
                className="py-2 text-xs font-medium text-base-secondary"
              >
                {day}
              </span>
            ))}
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const selectedDay = !!selected && isSameDay(day, selected);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isUnavailable(day)}
                  aria-pressed={selectedDay}
                  onClick={() => selectDate(day)}
                  className={`mx-auto h-9 w-9 rounded-full text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                    selectedDay
                      ? 'bg-primary-600 font-semibold text-white'
                      : isSameMonth(day, visibleMonth)
                        ? 'text-base-primary hover:bg-secondary'
                        : 'text-base-tertiary hover:bg-secondary'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between border-t border-base-primary pt-2">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="px-2 py-1 text-sm text-primary-600 hover:underline"
            >
              {t('common.clear')}
            </button>
            <button
              type="button"
              onClick={() => selectDate(new Date())}
              className="px-2 py-1 text-sm text-primary-600 hover:underline"
            >
              {t('common.today')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
