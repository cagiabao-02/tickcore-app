/**
 * Trang quản lý người dùng (Admin).
 * Tìm kiếm, khóa/mở khóa tài khoản, xem thông tin.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Lock, Unlock } from 'lucide-react';
import { adminListUsersApi, adminLockUserApi, adminUnlockUserApi, changeRoleApi } from '../api';
import Select from '@/components/ui/Select';
import ErrorState from '@/components/common/ErrorState';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/format';
import { useLanguageStore } from '@/stores/languageStore';
import type { User, Role } from '@/types';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 400);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users', debouncedKeyword],
    queryFn: () => adminListUsersApi(debouncedKeyword).then((r) => r.data),
  });

  const lockMutation = useMutation({
    mutationFn: (id: number) => adminLockUserApi(id),
    onSuccess: () => {
      addToast('success', t('common.updated'));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => changeRoleApi(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      addToast('success', t('common.updated'));
    },
    onError: () => addToast('error', t('common.error')),
  });

  const unlockMutation = useMutation({
    mutationFn: (id: number) => adminUnlockUserApi(id),
    onSuccess: () => {
      addToast('success', t('common.updated'));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const columns: Column<User>[] = [
    {
      key: 'fullName',
      sortable: true,
      header: t('admin.userName'),
      render: (u) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-700">{u.fullName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{u.fullName}</p>
            <p className="text-xs text-base-tertiary">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: t('admin.phone'), render: (u) => u.phone || '—' },
    {
      key: 'role',
      sortable: true,
      header: t('admin.role'),
      render: (u) => (
        <Select
          aria-label={`${t('admin.role')} ${u.fullName}`}
          value={u.role}
          disabled={roleMutation.isPending}
          options={(['USER', 'ADMIN'] as const).map((value) => ({
            value,
            label: t(`values.${value}`),
          }))}
          onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as Role })}
        />
      ),
    },
    {
      key: 'created',
      header: t('admin.createdAt'),
      render: (u) => formatDate(u.createdAt, language),
    },
    {
      key: 'status',
      header: t('admin.status'),
      render: (u) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${u.locked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}
        >
          {u.locked ? t('admin.locked') : t('admin.active')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (u) =>
        u.role !== 'ADMIN' ? (
          u.locked ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => unlockMutation.mutate(u.id)}
              leftIcon={<Unlock className="h-3.5 w-3.5" />}
            >
              {t('admin.unlock')}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-error-500"
              onClick={() => lockMutation.mutate(u.id)}
              leftIcon={<Lock className="h-3.5 w-3.5" />}
            >
              {t('admin.lock')}
            </Button>
          )
        ) : null,
    },
  ];

  if (error) return <ErrorState onRetry={() => void refetch()} />;
  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="text-2xl font-bold text-base-primary">{t('admin.users')}</h1>
      <Input
        placeholder={t('common.search')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />
      <DataTable
        columns={columns}
        data={data?.content || []}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
      />
    </div>
  );
}
