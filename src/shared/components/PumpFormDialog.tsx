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

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
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
  const [touchedFields, setTouchedFields] = useState<Record<keyof PumpDraft, boolean>>({
    id: false,
    name: false,
    manufacturer: false,
    minRate: false,
    maxRate: false,
    impellerFrequency: false,
    head: false,
    supply: false,
    userId: false,
    curvePoints: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setSubmitAttempted(false);
      setTouchedFields({
        id: false,
        name: false,
        manufacturer: false,
        minRate: false,
        maxRate: false,
        impellerFrequency: false,
        head: false,
        supply: false,
        userId: false,
        curvePoints: false,
      });
    }
  }, [open, initial]);

  const setField = <K extends keyof PumpDraft>(key: K, value: PumpDraft[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const touchField = <K extends keyof PumpDraft>(key: K) => {
    setTouchedFields((prev) => ({ ...prev, [key]: true }));
  };
  const shouldShowError = <K extends keyof PumpDraft>(key: K) => {
    return submitAttempted || touchedFields[key];
  };

  const isManufacturerValid = form.manufacturer.trim().length > 0;
  const isModelValid = form.name.trim().length > 0;
  const isImpellerFrequencyValid = isPositive(form.impellerFrequency);
  const isSupplyValid = isPositive(form.supply);
  const isHeadValid = isPositive(form.head);
  const isMinRateValid = isPositive(form.minRate);
  const isMaxRateValid = isPositive(form.maxRate);
  const isFormValid =
    isManufacturerValid &&
    isModelValid &&
    isImpellerFrequencyValid &&
    isSupplyValid &&
    isHeadValid &&
    isMinRateValid &&
    isMaxRateValid;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} sx={{ mt: 0.5 }}>
          <TextField
            label="Производитель"
            value={form.manufacturer}
            onChange={(e) => setField('manufacturer', e.target.value)}
            onBlur={() => touchField('manufacturer')}
            size="small"
            error={shouldShowError('manufacturer') && !isManufacturerValid}
            helperText={shouldShowError('manufacturer') && !isManufacturerValid ? 'Поле обязательно' : undefined}
          />
          <TextField
            label="Модель"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => touchField('name')}
            size="small"
            error={shouldShowError('name') && !isModelValid}
            helperText={shouldShowError('name') && !isModelValid ? 'Поле обязательно' : undefined}
          />
          <TextField
            label="Частота вращения, Гц"
            value={String(form.impellerFrequency)}
            onChange={(e) => setField('impellerFrequency', toNumber(e.target.value))}
            onBlur={() => touchField('impellerFrequency')}
            size="small"
            error={shouldShowError('impellerFrequency') && !isImpellerFrequencyValid}
            helperText={
              shouldShowError('impellerFrequency') && !isImpellerFrequencyValid ? 'Значение должно быть больше 0' : undefined
            }
          />
          <TextField
            label="Подача, м³/час"
            value={String(form.supply)}
            onChange={(e) => setField('supply', toNumber(e.target.value))}
            onBlur={() => touchField('supply')}
            size="small"
            error={shouldShowError('supply') && !isSupplyValid}
            helperText={shouldShowError('supply') && !isSupplyValid ? 'Значение должно быть больше 0' : undefined}
          />
          <TextField
            label="Напор, м"
            value={String(form.head)}
            onChange={(e) => setField('head', toNumber(e.target.value))}
            onBlur={() => touchField('head')}
            size="small"
            error={shouldShowError('head') && !isHeadValid}
            helperText={shouldShowError('head') && !isHeadValid ? 'Значение должно быть больше 0' : undefined}
          />
          <TextField
            label="Минимальный расход, м³/час"
            value={String(form.minRate)}
            onChange={(e) => setField('minRate', toNumber(e.target.value))}
            onBlur={() => touchField('minRate')}
            size="small"
            error={shouldShowError('minRate') && !isMinRateValid}
            helperText={shouldShowError('minRate') && !isMinRateValid ? 'Значение должно быть больше 0' : undefined}
          />
          <TextField
            label="Максимальный расход, м³/час"
            value={String(form.maxRate)}
            onChange={(e) => setField('maxRate', toNumber(e.target.value))}
            onBlur={() => touchField('maxRate')}
            size="small"
            error={shouldShowError('maxRate') && !isMaxRateValid}
            helperText={shouldShowError('maxRate') && !isMaxRateValid ? 'Значение должно быть больше 0' : undefined}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={() => {
            setSubmitAttempted(true);
            if (!isFormValid) {
              return;
            }
            void onSubmit(form);
          }}
          disabled={loading || !isFormValid}
          variant="contained"
        >
          {loading ? '...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
