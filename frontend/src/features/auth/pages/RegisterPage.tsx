/**
 * Trang đăng ký tài khoản.
 * Kiểm tra dữ liệu bằng Zod; hiện lỗi từng ô; ẩn/hiện mật khẩu.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, Eye, EyeOff, User, Film } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { registerApi } from '../api';

const registerSchema = z
  .object({
    fullName: z.string().min(1, 'required'),
    email: z.string().min(1, 'required').email('invalidEmail'),
    password: z.string().min(6, 'passwordMin'),
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      registerApi({ email: data.email, fullName: data.fullName, password: data.password }),
    onSuccess: () => {
      addToast('success', t('auth.registerSuccess'));
      navigate('/login');
    },
    onError: () => {
      addToast('error', t('errors.serverError'));
    },
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl mb-4">
            <Film className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-base-primary">{t('auth.registerTitle')}</h1>
        </div>

        <form
          onSubmit={handleSubmit((data) => registerMutation.mutate(data))}
          className="bg-card rounded-2xl border border-base-primary p-6 shadow-theme-lg space-y-5"
        >
          <Input
            label={t('auth.fullName')}
            leftIcon={<User className="h-4 w-4" />}
            error={errors.fullName ? t(`errors.${errors.fullName.message}`) : undefined}
            {...register('fullName')}
          />
          <Input
            label={t('auth.email')}
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email ? t(`errors.${errors.email.message}`) : undefined}
            {...register('email')}
          />
          <Input
            label={t('auth.password')}
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

          <Button type="submit" fullWidth isLoading={registerMutation.isPending} size="lg">
            {t('auth.registerTitle')}
          </Button>
        </form>

        <p className="text-center text-sm text-base-secondary mt-6">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            {t('auth.loginNow')}
          </Link>
        </p>
      </div>
    </div>
  );
}
