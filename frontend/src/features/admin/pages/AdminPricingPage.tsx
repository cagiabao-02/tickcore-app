/** Cấu hình giá ghế và phụ thu định dạng/cuối tuần; lưu qua API để áp dụng khi chọn ghế. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPricingApi, savePricingApi } from '../api';
import type { TicketPricing } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorState from '@/components/common/ErrorState';
import Skeleton from '@/components/ui/Skeleton';

const columns = ['basePrice', 'surcharge3D', 'surchargeIMAX', 'weekendSurcharge'] as const;
export default function AdminPricingPage() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['admin', 'pricing'],
    queryFn: () => getPricingApi().then((r) => r.data),
  });
  const [draft, setDraft] = useState<TicketPricing[] | null>(null);
  const save = useMutation({
    mutationFn: savePricingApi,
    onSuccess: () => {
      setDraft(null);
      void client.invalidateQueries();
    },
  });
  if (query.isLoading) return <Skeleton count={4} />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  const rows = draft || query.data || [];
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(rows);
      }}
    >
      <h1 className="text-2xl font-bold">{t('admin.pricing')}</h1>
      {rows.map((row, index) => (
        <fieldset className="bg-card p-4 border rounded-xl grid sm:grid-cols-2 gap-3" key={row.id}>
          <legend>{t(`values.${row.seatType}`)}</legend>
          {columns.map((key) => (
            <Input
              key={key}
              label={t(`pricing.${key}`)}
              type="number"
              min={0}
              step={1}
              required
              value={row[key]}
              onChange={(e) =>
                setDraft(
                  rows.map((item, i) =>
                    i === index ? { ...item, [key]: Number(e.target.value) } : item,
                  ),
                )
              }
            />
          ))}
        </fieldset>
      ))}
      {save.isError && <p role="alert">{t('common.error')}</p>}
      {save.isSuccess && <p role="status">{t('common.updated')}</p>}
      <Button type="submit" isLoading={save.isPending}>
        {t('common.save')}
      </Button>
    </form>
  );
}
