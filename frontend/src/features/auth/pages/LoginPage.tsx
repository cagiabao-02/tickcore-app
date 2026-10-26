/**
 * Trang đăng nhập.
 * Kiểm tra dữ liệu bằng Zod; hiện lỗi từng ô; ẩn/hiện mật khẩu;
 * "ghi nhớ đăng nhập"; sau đăng nhập quay lại trang đang xem dở.
 */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, Eye, EyeOff, Film } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { saveTokens } from '@/lib/tokenStorage';
import { loginApi, getMeApi } from '../api';

const loginSchema = z.object({
  email: z.string().min(1, 'required').email('invalidEmail'),
  password: z.string().min(6, 'passwordMin'),
  rememberMe: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await loginApi({ email: data.email, password: data.password });
      saveTokens(res.data.accessToken, res.data.refreshToken, data.rememberMe);
      const meRes = await getMeApi();
      return meRes.data;
    },
    onSuccess: (user) => {
      setUser(user);
      addToast('success', t('auth.loginSuccess'));
      navigate(redirect, { replace: true });
    },
    onError: () => {
      addToast('error', t('errors.loginFailed'));
    },
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl mb-4">
            <Film className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-base-primary">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-base-secondary mt-1">{t('home.bannerSub')}</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
          className="bg-card rounded-2xl border border-base-primary p-6 shadow-theme-lg space-y-5"
        >
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
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password ? t(`errors.${errors.password.message}`) : undefined}
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-base-secondary cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-base-primary"
                {...register('rememberMe')}
              />
              {t('auth.rememberMe')}
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" fullWidth isLoading={loginMutation.isPending} size="lg">
            {t('auth.loginTitle')}
          </Button>

          {/* Demo accounts hint */}
          <div className="p-3 bg-secondary rounded-lg text-xs text-base-secondary space-y-1">
            <p className="font-medium">{t('auth.demoTitle')}</p>
            <p>{t('auth.demoUser')}</p>
            <p>{t('auth.demoAdmin')}</p>
          </div>
        </form>

        <p className="text-center text-sm text-base-secondary mt-6">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            {t('auth.registerNow')}
          </Link>
        </p>
      </div>
    </div>
  );
}
