/** Quản lý CRUD đầy đủ: tìm kiếm, lọc, sắp xếp, phân trang, form Zod và xác nhận xóa. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  listAdminResourceApi,
  saveAdminResourceApi,
  deleteAdminResourceApi,
  type AdminResource,
  type AdminItem,
} from '../api';
import { listCitiesApi } from '@/features/cinemas/api';
import { listGenresApi } from '@/features/movies/api';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import ErrorState from '@/components/common/ErrorState';
import { useToast } from '@/components/ui/Toast';
import type { ApiError } from '@/types';
import SeatLayoutEditor from './SeatLayoutEditor';
import { toISODate } from '@/lib/format';

interface Field {
  name: string;
  label: string;
  type?: string;
  options?: string[];
  optional?: boolean;
}
const fields: Record<AdminResource, Field[]> = {
  movies: [
    { name: 'title', label: 'admin.movieTitle' },
    { name: 'originalTitle', label: 'admin.originalTitle' },
    { name: 'posterUrl', label: 'admin.posterUrl', type: 'url' },
    { name: 'bannerUrl', label: 'admin.bannerUrl', type: 'url', optional: true },
    { name: 'trailerUrl', label: 'admin.trailerUrl', type: 'url', optional: true },
    { name: 'description', label: 'movies.description', type: 'textarea' },
    { name: 'duration', label: 'movies.duration', type: 'number' },
    { name: 'releaseDate', label: 'movies.releaseDate', type: 'date' },
    { name: 'language', label: 'movies.language' },
    { name: 'ageRating', label: 'movies.ageRating', options: ['P', 'K', 'T13', 'T16', 'T18'] },
    { name: 'director', label: 'movies.director' },
    { name: 'cast', label: 'movies.cast' },
    { name: 'status', label: 'admin.status', options: ['COMING_SOON', 'NOW_SHOWING', 'STOPPED'] },
    { name: 'genres', label: 'movies.genre', type: 'genres' },
  ],
  cinemas: [
    { name: 'name', label: 'admin.cinemaName' },
    { name: 'city', label: 'admin.city', type: 'cities' },
    { name: 'address', label: 'admin.address' },
    { name: 'phone', label: 'auth.phone', type: 'tel' },
  ],
  rooms: [
    { name: 'name', label: 'admin.roomName' },
    { name: 'cinemaId', label: 'admin.cinemas', type: 'cinemas' },
    { name: 'totalRows', label: 'admin.rows', type: 'number' },
    { name: 'totalColumns', label: 'admin.columns', type: 'number' },
  ],
  showtimes: [
    { name: 'movieId', label: 'admin.movies', type: 'movies' },
    { name: 'roomId', label: 'admin.rooms', type: 'rooms' },
    { name: 'startTime', label: 'common.time', type: 'datetime-local' },
    { name: 'format', label: 'showtimes.format', options: ['2D', '3D', 'IMAX'] },
    { name: 'subtitleType', label: 'admin.subtitle', options: ['SUBTITLED', 'DUBBED'] },
    { name: 'basePrice', label: 'common.price', type: 'number' },
  ],
  combos: [
    { name: 'name', label: 'admin.comboName' },
    { name: 'description', label: 'admin.comboDescription', type: 'textarea' },
    { name: 'imageUrl', label: 'admin.comboImage', type: 'url' },
    { name: 'price', label: 'common.price', type: 'number' },
    { name: 'active', label: 'common.active', type: 'boolean' },
  ],
  promotions: [
    { name: 'code', label: 'booking.promoCode' },
    { name: 'type', label: 'admin.promoType', options: ['PERCENTAGE', 'FIXED_AMOUNT'] },
    { name: 'value', label: 'admin.promoValue', type: 'number' },
    { name: 'minOrderAmount', label: 'admin.minOrder', type: 'number' },
    { name: 'maxDiscount', label: 'admin.maxDiscount', type: 'number', optional: true },
    { name: 'startDate', label: 'admin.startDate', type: 'date' },
    { name: 'endDate', label: 'admin.endDate', type: 'date' },
    { name: 'usageLimit', label: 'admin.usageLimit', type: 'number' },
    { name: 'active', label: 'common.active', type: 'boolean' },
  ],
};
const numbers = new Set([
  'duration',
  'totalRows',
  'totalColumns',
  'movieId',
  'roomId',
  'cinemaId',
  'basePrice',
  'price',
  'value',
  'minOrderAmount',
  'maxDiscount',
  'usageLimit',
]);
const defaults: Record<AdminResource, Partial<AdminItem>> = {
  movies: { averageRating: 0, totalReviews: 0, endDate: null },
  cinemas: { totalRooms: 0 },
  rooms: {},
  showtimes: {},
  combos: {},
  promotions: { usedCount: 0 },
};

export default function ResourceManager({ resource }: { resource: AdminResource }) {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const { addToast } = useToast();
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
  const [editor, setEditor] = useState<AdminItem | 'new' | null>(null);
  const [target, setTarget] = useState<AdminItem | null>(null);
  const [layoutRoom, setLayoutRoom] = useState<number | null>(null);
  const [calendar, setCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => toISODate(new Date()));
  const query = useQuery({
    queryKey: ['admin', resource],
    queryFn: () => listAdminResourceApi(resource).then((r) => r.data),
  });
  const cities = useQuery({
    queryKey: ['cities'],
    queryFn: () => listCitiesApi().then((r) => r.data),
  });
  const genres = useQuery({
    queryKey: ['genres'],
    queryFn: () => listGenresApi().then((r) => r.data),
  });
  const cinemas = useQuery({
    queryKey: ['admin', 'cinemas', 'options'],
    queryFn: () => listAdminResourceApi('cinemas').then((r) => r.data.content),
  });
  const movies = useQuery({
    queryKey: ['admin', 'movies', 'options'],
    queryFn: () => listAdminResourceApi('movies').then((r) => r.data.content),
  });
  const rooms = useQuery({
    queryKey: ['admin', 'rooms', 'options'],
    queryFn: () => listAdminResourceApi('rooms').then((r) => r.data.content),
  });
  const schema = z.record(z.string(), z.string()).superRefine((values, ctx) => {
    for (const field of fields[resource]) {
      const value = (values[field.name] || '').trim();
      if (!value && !field.optional)
        ctx.addIssue({ code: 'custom', path: [field.name], message: 'errors.required' });
      if (
        value &&
        numbers.has(field.name) &&
        (!Number.isFinite(Number(value)) || Number(value) < 0 || !Number.isInteger(Number(value)))
      )
        ctx.addIssue({ code: 'custom', path: [field.name], message: 'errors.invalidNumber' });
      if (value && field.type === 'url' && (!URL.canParse(value) || !/^https?:/.test(value)))
        ctx.addIssue({ code: 'custom', path: [field.name], message: 'errors.invalidUrl' });
    }
    if (resource === 'movies' && Number(values.duration) <= 0)
      ctx.addIssue({ code: 'custom', path: ['duration'], message: 'errors.invalidNumber' });
    if (resource === 'promotions' && values.endDate < values.startDate)
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'errors.invalidDateRange' });
    if (
      resource === 'promotions' &&
      values.type === 'PERCENTAGE' &&
      (Number(values.value) <= 0 || Number(values.value) > 100)
    )
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'errors.invalidNumber' });
    if (resource === 'rooms')
      for (const [key, max] of [
        ['totalRows', 26],
        ['totalColumns', 30],
      ] as const)
        if (Number(values[key]) < 1 || Number(values[key]) > max)
          ctx.addIssue({ code: 'custom', path: [key], message: 'errors.invalidNumber' });
  });
  const form = useForm<Record<string, string>>({ resolver: zodResolver(schema) });
  const invalidate = () => {
    void client.invalidateQueries();
  };
  const save = useMutation({
    mutationFn: (values: Record<string, string>) => {
      const body: Record<string, unknown> =
        editor && editor !== 'new' ? { ...editor } : { ...defaults[resource] };
      for (const field of fields[resource]) {
        const value = values[field.name] || '';
        body[field.name] = numbers.has(field.name)
          ? value
            ? Number(value)
            : null
          : field.type === 'boolean'
            ? value === 'true'
            : value || null;
      }
      if (resource === 'movies')
        body.genres = (genres.data || []).filter((g) =>
          values.genres.split(',').includes(String(g.id)),
        );
      if (resource === 'cinemas')
        body.city = cities.data?.find((c) => c.id === Number(values.city));
      if (resource === 'promotions') body.code = values.code.trim().toUpperCase();
      return saveAdminResourceApi(
        resource,
        body as Partial<AdminItem>,
        editor && editor !== 'new' ? editor.id : undefined,
      );
    },
    onSuccess: () => {
      setEditor(null);
      invalidate();
      addToast('success', t('common.updated'));
    },
    onError: (error: ApiError) => addToast('error', t(error.message || 'common.error')),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteAdminResourceApi(resource, id),
    onSuccess: () => {
      setTarget(null);
      invalidate();
    },
    onError: () => addToast('error', t('common.error')),
  });
  /** Nạp giá trị form khi bắt đầu thêm hoặc sửa, không ghi đè khi đang nhập. */
  const openEditor = (item: AdminItem | 'new') => {
    const values: Record<string, string> = {};
    const record = item === 'new' ? {} : (item as unknown as Record<string, unknown>);
    for (const field of fields[resource]) {
      const value = record[field.name];
      values[field.name] =
        value == null
          ? field.type === 'boolean'
            ? 'true'
            : field.options?.[0] || ''
          : String(value);
    }
    if (item !== 'new' && 'genres' in item) values.genres = item.genres.map((g) => g.id).join(',');
    if (item !== 'new' && 'city' in item) values.city = String(item.city.id);
    if (item !== 'new' && 'startTime' in item) {
      const date = new Date(item.startTime);
      values.startTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    form.reset(values);
    setEditor(item);
  };
  const label = (item: AdminItem) =>
    'title' in item
      ? item.title
      : 'name' in item
        ? item.name
        : 'code' in item
          ? item.code
          : `${item.movieTitle} · ${new Date(item.startTime).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}`;
  const filtered = (query.data?.content || []).filter(
    (item) =>
      JSON.stringify(item).toLocaleLowerCase().includes(keyword.toLocaleLowerCase()) &&
      (!filter || ('status' in item && item.status === filter)),
  );
  const sorted = [...filtered].sort(
    (a, b) => label(a).localeCompare(label(b)) * (direction === 'asc' ? 1 : -1),
  );
  const pageCount = Math.ceil(sorted.length / 10);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between">
        <h1 className="text-2xl font-bold">{t(`admin.${resource}`)}</h1>
        <Button onClick={() => openEditor('new')}>{t('common.create')}</Button>
      </div>
      <Input
        label={t('common.search')}
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setPage(0);
        }}
      />
      {resource === 'movies' && (
        <Select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
          options={[
            { value: '', label: t('common.all') },
            ...['NOW_SHOWING', 'COMING_SOON', 'STOPPED'].map((value) => ({
              value,
              label: t(`values.${value}`),
            })),
          ]}
        />
      )}
      {resource === 'showtimes' && (
        <Button variant="outline" onClick={() => setCalendar(!calendar)}>
          {t(calendar ? 'admin.tableView' : 'admin.calendarView')}
        </Button>
      )}
      {calendar && resource === 'showtimes' && (
        <Input
          type="date"
          label={t('common.date')}
          value={calendarDate}
          onChange={(e) => setCalendarDate(e.target.value)}
        />
      )}
      {calendar && resource === 'showtimes' ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {sorted
            .filter((item) => 'date' in item && item.date === calendarDate)
            .map((item) => (
              <div key={item.id} className="bg-card p-4 border rounded">
                <p>{label(item)}</p>
                {'roomName' in item && (
                  <p>
                    {item.cinemaName} · {item.roomName}
                  </p>
                )}
                <Button onClick={() => openEditor(item)}>{t('common.edit')}</Button>
              </div>
            ))}
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: 'name',
              header: t('admin.name'),
              sortable: true,
              render: (item: AdminItem) => label(item),
            },
            {
              key: 'info',
              header: t('common.status'),
              render: (item: AdminItem) =>
                'status' in item
                  ? t(`values.${item.status}`)
                  : 'active' in item
                    ? t(item.active ? 'common.active' : 'common.inactive')
                    : 'cinemaName' in item
                      ? item.cinemaName
                      : 'address' in item
                        ? item.address
                        : '',
            },
            {
              key: 'actions',
              header: t('common.actions'),
              render: (item: AdminItem) => (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => openEditor(item)}>
                    {t('common.edit')}
                  </Button>
                  <Button variant="ghost" onClick={() => setTarget(item)}>
                    {t('common.delete')}
                  </Button>
                  {resource === 'rooms' && (
                    <Button onClick={() => setLayoutRoom(item.id)}>{t('admin.seatLayout')}</Button>
                  )}
                </div>
              ),
            },
          ]}
          data={sorted.slice(currentPage * 10, (currentPage + 1) * 10)}
          keyExtractor={(item) => item.id}
          isLoading={query.isLoading}
          sortBy="name"
          sortDir={direction}
          onSort={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}
        />
      )}
      {pageCount > 1 && !calendar && (
        <Pagination currentPage={currentPage} totalPages={pageCount} onPageChange={setPage} />
      )}
      <Modal
        isOpen={!!editor}
        onClose={() => setEditor(null)}
        title={t(editor === 'new' ? 'common.create' : 'common.edit')}
        size="xl"
      >
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
          {fields[resource].map((field) => {
            const options =
              field.type === 'cities'
                ? cities.data?.map((c) => ({ value: String(c.id), label: c.name }))
                : field.type === 'cinemas'
                  ? cinemas.data?.map((c) => ({ value: String(c.id), label: c.name }))
                  : field.type === 'movies'
                    ? movies.data?.map((m) => ({ value: String(m.id), label: m.title }))
                    : field.type === 'rooms'
                      ? rooms.data?.map((r) => ({
                          value: String(r.id),
                          label: `${r.cinemaName} · ${r.name}`,
                        }))
                      : field.type === 'boolean'
                        ? [
                            { value: 'true', label: t('common.active') },
                            { value: 'false', label: t('common.inactive') },
                          ]
                        : field.options?.map((value) => ({
                            value,
                            label: t(`values.${value}`, { defaultValue: value }),
                          }));
            const error = form.formState.errors[field.name]?.message;
            if (field.type === 'genres')
              return (
                <fieldset key={field.name}>
                  <legend>{t(field.label)}</legend>
                  {genres.data?.map((g) => (
                    <label className="mr-3 inline-flex gap-1" key={g.id}>
                      <input
                        type="checkbox"
                        checked={(form.watch('genres') || '').split(',').includes(String(g.id))}
                        onChange={(e) => {
                          const selected = (form.getValues('genres') || '')
                            .split(',')
                            .filter(Boolean);
                          form.setValue(
                            'genres',
                            (e.target.checked
                              ? [...selected, String(g.id)]
                              : selected.filter((id) => id !== String(g.id))
                            ).join(','),
                            { shouldValidate: true },
                          );
                        }}
                      />
                      {g.name}
                    </label>
                  ))}
                  {error && <p role="alert">{t(error)}</p>}
                </fieldset>
              );
            if (options)
              return (
                <Select
                  key={field.name}
                  label={t(field.label)}
                  options={[{ value: '', label: t('common.select') }, ...options]}
                  {...form.register(field.name)}
                  error={error ? t(error) : undefined}
                />
              );
            return (
              <Input
                key={field.name}
                label={t(field.label)}
                type={field.type === 'textarea' ? 'text' : field.type || 'text'}
                {...form.register(field.name)}
                error={error ? t(error) : undefined}
              />
            );
          })}
          <Button type="submit" isLoading={save.isPending}>
            {t('common.save')}
          </Button>
        </form>
      </Modal>
      <Modal isOpen={!!target} onClose={() => setTarget(null)} title={t('common.confirmDelete')}>
        <p>{t('admin.deleteConfirm')}</p>
        <Button
          variant="danger"
          isLoading={remove.isPending}
          onClick={() => target && remove.mutate(target.id)}
        >
          {t('common.delete')}
        </Button>
      </Modal>
      {layoutRoom && rooms.data && (
        <SeatLayoutEditor
          room={rooms.data?.find((r) => r.id === layoutRoom)}
          onClose={() => setLayoutRoom(null)}
        />
      )}
    </div>
  );
}
