/**
 * Trang đặt lại mật khẩu - nhập mật khẩu mới.
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { resetPasswordApi } from '../api';

const schema = z
  .object({
    password: z.string().min(6, 'passwordMin'),
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: ResetForm) => resetPasswordApi(token, data.password),
    onSuccess: () => {
      addToast('success', t('auth.resetSuccess'));
      navigate('/login');
    },
    onError: () => addToast('error', t('errors.serverError')),
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-base-primary">{t('auth.resetPasswordTitle')}</h1>
          <p className="text-sm text-base-secondary mt-2">{t('auth.resetPasswordDesc')}</p>
        </div>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="bg-card rounded-2xl border border-base-primary p-6 shadow-theme-lg space-y-5"
        >
          <Input
            label={t('auth.newPassword')}
            type={showPassword ? 'text' : 'password'}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-base-tertiary hover:text-base-secondary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password ? t(`errors.${errors.password.message}`) : undefined}
            {...register('password')}
          />
          <Input
            label={t('auth.confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            leftIcon={<Lock className="h-4 w-4" />}
            error={
              errors.confirmPassword ? t(`errors.${errors.confirmPassword.message}`) : undefined
            }
            {...register('confirmPassword')}
          />
          <Button type="submit" fullWidth isLoading={mutation.isPending} size="lg">
            {t('auth.resetPassword')}
          </Button>
        </form>
      </div>
    </div>
  );
}
