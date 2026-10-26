/**
 * Hàm tiện ích định dạng tiền tệ và ngày giờ.
 * Sử dụng Intl.NumberFormat cho VND và date-fns cho ngày.
 */
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

/** Định dạng số tiền theo VND */
export function formatCurrency(amount: number, locale: string = 'vi'): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Lấy locale cho date-fns */
function getDateLocale(locale: string) {
  return locale === 'vi' ? vi : enUS;
}

/** Định dạng ngày theo locale (VD: "26/10/2026" hoặc "Oct 26, 2026") */
export function formatDate(dateStr: string, locale: string = 'vi'): string {
  const date = parseISO(dateStr);
  const pattern = locale === 'vi' ? 'dd/MM/yyyy' : 'MMM dd, yyyy';
  return format(date, pattern, { locale: getDateLocale(locale) });
}

/** Định dạng giờ chiếu (VD: "19:30") */
export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm');
}

/** Định dạng ngày giờ đầy đủ */
export function formatDateTime(dateStr: string, locale: string = 'vi'): string {
  const date = parseISO(dateStr);
  const pattern = locale === 'vi' ? 'HH:mm - dd/MM/yyyy' : 'HH:mm - MMM dd, yyyy';
  return format(date, pattern, { locale: getDateLocale(locale) });
}

/** Định dạng "cách đây bao lâu" */
export function formatRelativeTime(dateStr: string, locale: string = 'vi'): string {
  return formatDistanceToNow(parseISO(dateStr), {
    addSuffix: true,
    locale: getDateLocale(locale),
  });
}

/** Kiểm tra thời điểm đã qua chưa */
export function isPast(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), new Date());
}

/** Kiểm tra thời điểm còn trong tương lai */
export function isFuture(dateStr: string): boolean {
  return isAfter(parseISO(dateStr), new Date());
}

/** Định dạng thời lượng phim (phút -> "2h15'") */
export function formatDuration(minutes: number, locale: string = 'vi'): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (locale === 'vi') {
    return h > 0 ? `${h}h${m > 0 ? m + "'" : ''}` : `${m}'`;
  }
  return h > 0 ? `${h}h ${m > 0 ? m + 'min' : ''}` : `${m}min`;
}

/** Định dạng ngày dạng thứ + ngày (VD: "T2, 26/10") */
export function formatShortDate(dateStr: string, locale: string = 'vi'): string {
  const date = parseISO(dateStr);
  const pattern = locale === 'vi' ? 'EEEEEE, dd/MM' : 'EEE, MM/dd';
  return format(date, pattern, { locale: getDateLocale(locale) });
}

/** Lấy ngày ISO (yyyy-MM-dd) */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
