/**
 * Trang hồ sơ cá nhân.
 * Tab: Thông tin / Đổi mật khẩu. Chỉnh sửa họ tên, SĐT, ngày sinh.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { updateProfileApi, changePasswordApi } from '../api';
import { useAuthStore } from '@/stores/authStore';
import Tabs from '@/components/ui/Tabs';
import Input from '@/components/ui/Input';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const profileSchema = z.object({
  fullName: z.string().min(1, 'required'),
  phone: z.string().min(1, 'required'),
  dateOfBirth: z.string().nullable(),
  avatarUrl: z.union([z.literal(''), z.url('invalidUrl')]).nullable(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'required'),
    newPassword: z.string().min(6, 'passwordMin'),
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState('info');
  const [showPw, setShowPw] = useState(false);

  const {
    register: regProfile,
    control: profileControl,
    handleSubmit: handleProfile,
    formState: { errors: errP },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const {
    register: regPw,
    handleSubmit: handlePw,
    formState: { errors: errPw },
    reset: resetPw,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    shouldUnregister: true,
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      updateProfileApi({
        ...data,
        dateOfBirth: data.dateOfBirth || null,
        avatarUrl: data.avatarUrl || null,
      }).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      addToast('success', t('profile.updateSuccess'));
    },
    onError: () => addToast('error', t('errors.serverError')),
  });

  const pwMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      changePasswordApi({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      addToast('success', t('profile.passwordChanged'));
      resetPw();
    },
    onError: () => addToast('error', t('errors.serverError')),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-base-primary mb-6">{t('profile.title')}</h1>

      <Tabs
        tabs={[
          { key: 'info', label: t('profile.info') },
          { key: 'password', label: t('profile.changePassword') },
        ]}
        activeTab={tab}
        onChange={(next) => {
          resetPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setShowPw(false);
          setTab(next);
        }}
      />

      <div className="mt-6 bg-card rounded-xl border border-base-primary p-6">
        {tab === 'info' ? (
          <form
            key="profile-form"
            onSubmit={handleProfile((d) => profileMutation.mutate(d))}
            className="space-y-5"
          >
            <Input
              label={t('auth.email')}
              value={user?.email || ''}
              disabled
              className="opacity-60"
            />
            <Input
              label={t('auth.fullName')}
              leftIcon={<User className="h-4 w-4" />}
              error={errP.fullName ? t(`errors.${errP.fullName.message}`) : undefined}
              {...regProfile('fullName')}
            />
            <Input
              label={t('profile.phone')}
              type="tel"
              error={errP.phone ? t(`errors.${errP.phone.message}`) : undefined}
              {...regProfile('phone')}
            />
            <Controller
              control={profileControl}
              name="dateOfBirth"
              render={({ field }) => (
                <DatePicker
                  label={t('profile.dateOfBirth')}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Input
              label={t('profile.avatar')}
              type="url"
              {...regProfile('avatarUrl')}
              error={errP.avatarUrl ? t('errors.invalidUrl') : undefined}
            />
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <Button type="submit" isLoading={profileMutation.isPending}>
              {t('common.save')}
            </Button>
          </form>
        ) : (
          <form
            key="password-form"
            onSubmit={handlePw((d) => pwMutation.mutate(d))}
            className="space-y-5"
          >
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={user?.email || ''}
              readOnly
              hidden
            />
            <Input
              id="profile-current-password"
              autoComplete="current-password"
              label={t('profile.currentPassword')}
              type={showPw ? 'text' : 'password'}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  aria-label={t(showPw ? 'auth.hidePassword' : 'auth.showPassword')}
                  onClick={() => setShowPw(!showPw)}
                  className="text-base-tertiary hover:text-base-secondary"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={
                errPw.currentPassword ? t(`errors.${errPw.currentPassword.message}`) : undefined
              }
              {...regPw('currentPassword')}
            />
            <Input
              id="profile-new-password"
              autoComplete="new-password"
              label={t('auth.newPassword')}
              type={showPw ? 'text' : 'password'}
              leftIcon={<Lock className="h-4 w-4" />}
              error={errPw.newPassword ? t(`errors.${errPw.newPassword.message}`) : undefined}
              {...regPw('newPassword')}
            />
            <Input
              id="profile-confirm-password"
              autoComplete="new-password"
              label={t('auth.confirmPassword')}
              type={showPw ? 'text' : 'password'}
              leftIcon={<Lock className="h-4 w-4" />}
              error={
                errPw.confirmPassword ? t(`errors.${errPw.confirmPassword.message}`) : undefined
              }
              {...regPw('confirmPassword')}
            />
            <Button type="submit" isLoading={pwMutation.isPending}>
              {t('profile.changePassword')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
