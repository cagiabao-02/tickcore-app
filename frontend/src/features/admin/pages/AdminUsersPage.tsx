/**
 * Trang quản lý người dùng (Admin).
 * Tìm kiếm, khóa/mở khóa tài khoản, xem thông tin.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Lock, Unlock, History, X } from 'lucide-react';
import {
  adminListUsersApi,
  adminLockUserApi,
  adminUnlockUserApi,
  adminUserRoleHistoryApi,
  changeRoleApi,
} from '../api';
import Select from '@/components/ui/Select';
import ErrorState from '@/components/common/ErrorState';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatDateTime } from '@/lib/format';
import { useLanguageStore } from '@/stores/languageStore';
import type { User, Role } from '@/types';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const debouncedKeyword = useDebounce(keyword, 400);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users', debouncedKeyword],
    queryFn: () => adminListUsersApi(debouncedKeyword).then((r) => r.data),
  });
  const roleHistoryQuery = useQuery({
    queryKey: ['admin', 'users', historyUser?.id, 'role-history'],
    queryFn: () => adminUserRoleHistoryApi(historyUser!.id).then((response) => response.data),
    enabled: historyUser !== null,
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
      render: (u) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHistoryUser(u)}
            leftIcon={<History className="h-3.5 w-3.5" />}
          >
            {t('admin.roleHistory')}
          </Button>
          {u.role !== 'ADMIN' && (u.locked ? (
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
          ))}
        </div>
      ),
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
      {historyUser && (
        <section
          aria-labelledby="role-history-heading"
          className="rounded-xl border border-base-border bg-base-surface p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 id="role-history-heading" className="text-lg font-semibold text-base-primary">
                {t('admin.roleHistory')} · {historyUser.fullName}
              </h2>
              <p className="text-sm text-base-secondary">{historyUser.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('common.close')}
              onClick={() => setHistoryUser(null)}
              leftIcon={<X className="h-4 w-4" />}
            >
              {t('common.close')}
            </Button>
          </div>
          {roleHistoryQuery.isLoading ? (
            <p className="text-sm text-base-secondary">{t('common.loading')}</p>
          ) : roleHistoryQuery.isError ? (
            <p role="alert" className="text-sm text-error-500">{t('common.error')}</p>
          ) : roleHistoryQuery.data?.content.length ? (
            <ol className="space-y-3">
              {roleHistoryQuery.data.content.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-base-border p-3">
                  <p className="font-medium text-base-primary">
                    {t(`values.${entry.oldRole}`)} → {t(`values.${entry.newRole}`)}
                  </p>
                  <p className="mt-1 text-sm text-base-secondary">
                    {t('admin.roleChangedBy')}: {entry.changedByName} ({entry.changedByEmail}) ·{' '}
                    {formatDateTime(entry.changedAt, language)}
                  </p>
                  {entry.reason && (
                    <p className="mt-1 text-sm text-base-secondary">
                      {t('admin.roleChangeReason')}: {entry.reason}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-base-secondary">{t('admin.noRoleHistory')}</p>
          )}
        </section>
      )}
    </div>
  );
}
