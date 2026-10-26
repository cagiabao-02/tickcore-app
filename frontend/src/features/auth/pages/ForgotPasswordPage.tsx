/**
 * Trang quên mật khẩu - nhập email để nhận link đặt lại.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, ArrowLeft } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { forgotPasswordApi } from '../api';

const schema = z.object({ email: z.string().min(1, 'required').email('invalidEmail') });
type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotForm) => forgotPasswordApi(data.email),
    onSuccess: () => addToast('success', t('auth.emailSent')),
    onError: () => addToast('error', t('errors.serverError')),
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-base-primary">{t('auth.forgotPasswordTitle')}</h1>
          <p className="text-sm text-base-secondary mt-2">{t('auth.forgotPasswordDesc')}</p>
        </div>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="bg-card rounded-2xl border border-base-primary p-6 shadow-theme-lg space-y-5"
        >
          <Input
            label={t('auth.email')}
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email ? t(`errors.${errors.email.message}`) : undefined}
            {...register('email')}
          />
          <Button type="submit" fullWidth isLoading={mutation.isPending} size="lg">
            {t('auth.sendResetLink')}
          </Button>
        </form>
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" /> {t('auth.loginNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}
