/**
 * Trang Dashboard admin.
 * Thẻ tóm tắt (doanh thu, đơn, suất chiếu, user mới);
 * Biểu đồ doanh thu 14 ngày; Top 5 phim; Tỷ lệ lấp đầy theo rạp.
 */
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorState from '@/components/common/ErrorState';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Ticket, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  getDashboardSummaryApi,
  getRevenueByDayApi,
  getTopMoviesApi,
  getOccupancyApi,
} from '../api';
import { formatCurrency, formatShortDate } from '@/lib/format';
import { useLanguageStore } from '@/stores/languageStore';
import Skeleton from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [group, setGroup] = useState('day');
  const range = { from: from || undefined, to: to || undefined };

  const {
    data: summary,
    isLoading: loadingSummary,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'summary', range],
    queryFn: () => getDashboardSummaryApi(range).then((r) => r.data),
  });
  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ['admin', 'revenue', range],
    queryFn: () => getRevenueByDayApi(range).then((r) => r.data),
  });
  const { data: topMovies } = useQuery({
    queryKey: ['admin', 'topMovies', range],
    queryFn: () => getTopMoviesApi(range).then((r) => r.data),
  });
  const { data: occupancy } = useQuery({
    queryKey: ['admin', 'occupancy', range],
    queryFn: () => getOccupancyApi(range).then((r) => r.data),
  });

  const summaryCards = summary
    ? [
        {
          label: t('admin.totalRevenue'),
          value: formatCurrency(summary.totalRevenue, language),
          change: summary.revenueChange,
          icon: DollarSign,
          color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        },
        {
          label: t('admin.totalBookings'),
          value: summary.totalBookings.toLocaleString(),
          change: summary.bookingsChange,
          icon: Ticket,
          color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
        },
        {
          label: t('admin.totalShowtimes'),
          value: summary.totalShowtimes.toLocaleString(),
          change: null,
          icon: Clock,
          color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
        },
        {
          label: t('admin.newUsers'),
          value: summary.newUsers.toLocaleString(),
          change: null,
          icon: Users,
          color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
        },
      ]
    : [];

  const grouped = new Map<string, number>();
  for (const item of revenue || []) {
    const key = group === 'month' ? item.date.slice(0, 7) : formatShortDate(item.date, language);
    grouped.set(key, (grouped.get(key) || 0) + item.revenue);
  }
  if (error) return <ErrorState onRetry={() => void refetch()} />;
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-base-primary">{t('admin.dashboard')}</h1>
      <div className="flex flex-wrap gap-3">
        <Input
          type="date"
          label={t('admin.startDate')}
          value={from}
          max={to || undefined}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          type="date"
          label={t('admin.endDate')}
          min={from || undefined}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Select
          label={t('common.filter')}
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          options={[
            { value: 'day', label: t('admin.byDay') },
            { value: 'month', label: t('admin.byMonth') },
          ]}
        />
      </div>

      {/* Thẻ tóm tắt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingSummary
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" className="h-28 rounded-xl" />
            ))
          : summaryCards.map((card) => (
              <div key={card.label} className="bg-card rounded-xl border border-base-primary p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-base-secondary">{card.label}</span>
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-base-primary">{card.value}</p>
                {card.change !== null && (
                  <div
                    className={`flex items-center gap-1 mt-1 text-xs ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {card.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {card.change >= 0 ? '+' : ''}
                    {card.change}%
                  </div>
                )}
              </div>
            ))}
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="bg-card rounded-xl border border-base-primary p-4">
        <h3 className="font-semibold text-base-primary mb-4">{t('admin.revenueChart')}</h3>
        {loadingRevenue ? (
          <Skeleton variant="rectangular" className="h-72 rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Array.from(grouped, ([dateLabel, revenue]) => ({ dateLabel, revenue }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} stroke="var(--text-secondary)" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--text-secondary)"
                tickFormatter={(v: number) =>
                  new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
                    notation: 'compact',
                  }).format(v)
                }
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value), language)} />
              <Bar dataKey="revenue" fill="var(--color-primary-600)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top phim */}
        <div className="bg-card rounded-xl border border-base-primary p-4">
          <h3 className="font-semibold text-base-primary mb-4">{t('admin.topMovies')}</h3>
          <div className="space-y-3">
            {topMovies?.map((movie, i) => (
              <div key={movie.movieId} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-primary-600 text-white' : 'bg-secondary text-base-secondary'}`}
                >
                  {i + 1}
                </span>
                <img
                  src={movie.posterUrl}
                  alt={movie.movieTitle}
                  className="w-10 h-14 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-base-primary line-clamp-1">
                    {movie.movieTitle}
                  </p>
                  <p className="text-xs text-base-tertiary">
                    {movie.totalTickets} {t('admin.tickets')} •{' '}
                    {formatCurrency(movie.totalRevenue, language)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tỷ lệ lấp đầy */}
        <div className="bg-card rounded-xl border border-base-primary p-4">
          <h3 className="font-semibold text-base-primary mb-4">{t('admin.occupancy')}</h3>
          <div className="space-y-4">
            {occupancy?.map((c) => (
              <div key={c.cinemaId}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-base-primary">{c.cinemaName}</span>
                  <span className="font-medium text-primary-600">{c.occupancyRate}%</span>
                </div>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${c.occupancyRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
