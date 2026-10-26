/** Chỉnh từng ô giữa ghế thường, VIP, đôi và lối đi, lưu sơ đồ qua lớp API. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Room, SeatLayout, SeatType } from '@/types';
import { saveSeatLayoutApi } from '../api';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SeatLayoutEditor({ room, onClose }: { room?: Room; onClose: () => void }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [rows, setRows] = useState(room?.totalRows || 8);
  const [columns, setColumns] = useState(room?.totalColumns || 10);
  const [types, setTypes] = useState<Record<string, SeatType>>(() =>
    Object.fromEntries(
      (
        room?.seatLayout?.seats ||
        Array.from({ length: rows * columns }, (_, index) => {
          const rowIndex = Math.floor(index / columns);
          const column = (index % columns) + 1;
          const type: SeatType =
            rowIndex === rows - 1 && column >= columns - 1
              ? 'COUPLE'
              : rowIndex >= rows - 2
                ? 'VIP'
                : 'STANDARD';
          return { row: String.fromCharCode(65 + rowIndex), column, type };
        })
      ).map((s) => [`${s.row}${s.column}`, s.type]),
    ),
  );
  const order: SeatType[] = ['STANDARD', 'VIP', 'COUPLE', 'AISLE'];
  const save = useMutation({
    mutationFn: () => {
      const seats: SeatLayout['seats'] = Array.from({ length: rows * columns }, (_, index) => {
        const row = String.fromCharCode(65 + Math.floor(index / columns));
        const column = (index % columns) + 1;
        return { row, column, type: types[`${row}${column}`] || 'STANDARD' };
      });
      return saveSeatLayoutApi(room!.id, { rows, columns, seats });
    },
    onSuccess: () => {
      void client.invalidateQueries();
      onClose();
    },
  });
  return (
    <Modal isOpen={!!room} onClose={onClose} title={t('admin.seatLayout')} size="full">
      <div className="flex gap-3 mb-4">
        <Input
          label={t('admin.rows')}
          type="number"
          min={1}
          max={26}
          value={rows}
          onChange={(e) => setRows(Math.max(1, Math.min(26, Number(e.target.value) || 1)))}
        />
        <Input
          label={t('admin.columns')}
          type="number"
          min={1}
          max={30}
          value={columns}
          onChange={(e) => setColumns(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
        />
      </div>
      <p className="mb-3">{t('admin.layoutHint')}</p>
      <div className="overflow-x-auto">
        <div
          className="grid gap-1 w-max"
          style={{ gridTemplateColumns: `repeat(${columns}, 64px)` }}
        >
          {Array.from({ length: rows * columns }, (_, index) => {
            const key = `${String.fromCharCode(65 + Math.floor(index / columns))}${(index % columns) + 1}`;
            const type = types[key] || 'STANDARD';
            return (
              <button
                type="button"
                className="bg-secondary rounded p-2 text-xs border"
                key={key}
                aria-label={`${key}: ${t(`values.${type}`)}`}
                onClick={() =>
                  setTypes({ ...types, [key]: order[(order.indexOf(type) + 1) % order.length] })
                }
              >
                {key}
                <br />
                {t(`values.${type}`)}
              </button>
            );
          })}
        </div>
      </div>
      {save.isError && <p role="alert">{t('common.error')}</p>}
      <Button className="mt-4" onClick={() => save.mutate()} isLoading={save.isPending}>
        {t('common.save')}
      </Button>
    </Modal>
  );
}
