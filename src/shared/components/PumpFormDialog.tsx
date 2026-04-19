import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import type { PumpDto } from 'entities/pumpDatabase/types/pumpTypes';

export type PumpDraft = {
  id: number;
  name: string;
  manufacturer: string;
  minRate: number;
  maxRate: number;
  impellerFrequency: number;
  head: number;
  supply: number;
  userId: number;
  curvePoints: PumpDto['curvePoints'];
};

type Props = {
  open: boolean;
  loading?: boolean;
  title: string;
  initialData?: PumpDto | null;
  onClose: () => void;
  onSubmit: (draft: PumpDraft) => void | Promise<void>;
};

function toNumber(value: string): number {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export default function PumpFormDialog({
  open,
  loading = false,
  title,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const initial = useMemo<PumpDraft>(
    () =>
      initialData
        ? {
            ...initialData,
          }
        : {
            id: 0,
            name: '',
            manufacturer: '',
            minRate: 0,
            maxRate: 0,
            impellerFrequency: 0,
            head: 0,
            supply: 0,
            userId: 0,
            curvePoints: [],
          },
    [initialData]
  );

  const [form, setForm] = useState<PumpDraft>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const setField = <K extends keyof PumpDraft>(key: K, value: PumpDraft[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} sx={{ mt: 0.5 }}>
          <TextField
            label="Производитель"
            value={form.manufacturer}
            onChange={(e) => setField('manufacturer', e.target.value)}
            size="small"
          />
          <TextField
            label="Модель"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            size="small"
          />
          <TextField
            label="Частота вращения, Гц"
            value={String(form.impellerFrequency)}
            onChange={(e) => setField('impellerFrequency', toNumber(e.target.value))}
            size="small"
          />
          <TextField
            label="Подача, м³/час"
            value={String(form.supply)}
            onChange={(e) => setField('supply', toNumber(e.target.value))}
            size="small"
          />
          <TextField
            label="Напор, м"
            value={String(form.head)}
            onChange={(e) => setField('head', toNumber(e.target.value))}
            size="small"
          />
          <TextField
            label="Минимальный расход, м³/час"
            value={String(form.minRate)}
            onChange={(e) => setField('minRate', toNumber(e.target.value))}
            size="small"
          />
          <TextField
            label="Максимальный расход, м³/час"
            value={String(form.maxRate)}
            onChange={(e) => setField('maxRate', toNumber(e.target.value))}
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={() => void onSubmit(form)}
          disabled={loading || !form.name.trim() || !form.manufacturer.trim()}
          variant="contained"
        >
          {loading ? '...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
