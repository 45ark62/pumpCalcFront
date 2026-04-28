import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Button,
} from '@mui/material';
import { BrushCleaning, EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState, type MouseEvent } from 'react';
import type { CurvePointDto, PumpDto } from 'entities/pumpDatabase/types/pumpTypes';

const BORDER = '1px solid rgba(30, 41, 59, 0.12)';
const HEADER_BG = '#dbeafe';
const TABLE_MAX_HEIGHT = { xs: 320, md: 500, lg: 'calc(100vh - 320px)' } as const;

const cellSx = {
  border: BORDER,
  borderColor: 'rgba(30, 41, 59, 0.12)',
  textAlign: 'center',
  verticalAlign: 'middle',
  p: 0.5,
  fontSize: '0.72rem',
  lineHeight: 1.2,
  bgcolor: 'background.paper',
  boxSizing: 'border-box',
} as const;

const headerCellSx = {
  ...cellSx,
  bgcolor: HEADER_BG,
  fontWeight: 700,
  fontSize: '0.74rem',
} as const;

function fmt(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 6 }).format(n);
}

function parseNum(s: string): number {
  const t = s.replace(/\s/g, '').replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

function parseNumOrNull(s: string): number | null {
  const t = s.replace(/\s/g, '').replace(',', '.');
  if (t.length === 0) {
    return null;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

type Props = {
  /** Скрыть шапку с названием — если заголовок вынесен в родителя */
  hideHeader?: boolean;
  pump: PumpDto | null;
  loading: boolean;
  curvePoints: CurvePointDto[];
  onCurvePointsChange: (next: CurvePointDto[]) => void;
  /** Сохранить на сервер (PUT): полный насос + переданный массив точек (пустой при очистке). */
  onPersistCurvePoints?: (next: CurvePointDto[]) => Promise<void>;
  onSaveCurvePoints: () => Promise<void>;
  savingCurve: boolean;
};

export default function PumpCurvePointsTable({
  hideHeader = false,
  pump,
  loading,
  curvePoints,
  onCurvePointsChange,
  onPersistCurvePoints,
  onSaveCurvePoints,
  savingCurve,
}: Props) {
  const canEdit = pump !== null && pump.userId !== 0;
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const [editOpen, setEditOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editRate, setEditRate] = useState('');
  const [editHead, setEditHead] = useState('');
  const [editEff, setEditEff] = useState('');
  const [editTouched, setEditTouched] = useState({
    rate: false,
    head: false,
    efficiency: false,
  });
  const [editSubmitAttempted, setEditSubmitAttempted] = useState(false);

  const openEdit = (index: number) => {
    const p = curvePoints[index];
    if (!p) return;
    setEditIndex(index);
    setEditRate(String(p.rate));
    setEditHead(String(p.head));
    setEditEff(String(p.efficiency));
    setEditTouched({ rate: false, head: false, efficiency: false });
    setEditSubmitAttempted(false);
    setEditOpen(true);
  };

  const persistIfUserPump = async (next: CurvePointDto[]) => {
    if (!canEdit || !onPersistCurvePoints) return;
    await onPersistCurvePoints(next);
  };

  const applyEdit = () => {
    if (editIndex === null) return;
    setEditSubmitAttempted(true);
    const nextRate = parseNumOrNull(editRate);
    const nextHead = parseNumOrNull(editHead);
    const nextEfficiency = parseNumOrNull(editEff);
    const isRateValid = nextRate !== null && nextRate >= 0;
    const isHeadValid = nextHead !== null && nextHead >= 0;
    const isEfficiencyValid =
      nextEfficiency !== null && nextEfficiency >= 0 && nextEfficiency <= 100;
    if (!isRateValid || !isHeadValid || !isEfficiencyValid) {
      return;
    }

    const next = [...curvePoints];
    const row = next[editIndex];
    if (!row) return;
    next[editIndex] = {
      ...row,
      rate: nextRate,
      head: nextHead,
      efficiency: nextEfficiency,
    };
    onCurvePointsChange(next);
    void persistIfUserPump(next);
    setEditOpen(false);
    setEditIndex(null);
  };

  const deleteRow = (index: number) => {
    const next = curvePoints.filter((_, i) => i !== index);
    onCurvePointsChange(next);
    void persistIfUserPump(next);
  };

  const addRow = () => {
    const next = [
      ...curvePoints,
      { id: 0, rate: 0, head: 0, efficiency: 0 },
    ];
    onCurvePointsChange(next);
    void persistIfUserPump(next);
  };

  const clearAll = () => {
    onCurvePointsChange([]);
    void persistIfUserPump([]);
  };

  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>, index: number) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setMenuIndex(index);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuIndex(null);
  };

  const dirty = useMemo(() => {
    if (!pump) return false;
    const orig = JSON.stringify(pump.curvePoints ?? []);
    const cur = JSON.stringify(curvePoints);
    return orig !== cur;
  }, [pump, curvePoints]);

  const parsedRate = parseNum(editRate);
  const parsedHead = parseNum(editHead);
  const parsedEfficiency = parseNumOrNull(editEff);
  const isRateValid = parseNumOrNull(editRate) !== null && parsedRate >= 0;
  const isHeadValid = parseNumOrNull(editHead) !== null && parsedHead >= 0;
  const isEfficiencyValid = parsedEfficiency !== null && parsedEfficiency >= 0 && parsedEfficiency <= 100;
  const shouldShowRateError = (editSubmitAttempted || editTouched.rate) && !isRateValid;
  const shouldShowHeadError = (editSubmitAttempted || editTouched.head) && !isHeadValid;
  const shouldShowEfficiencyError = (editSubmitAttempted || editTouched.efficiency) && !isEfficiencyValid;

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        flex: 1,
        border: BORDER,
        borderRadius: 2,
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: TABLE_MAX_HEIGHT,
        scrollbarGutter: 'stable',
        flexShrink: 0,
        bgcolor: '#f8fbff',
        boxShadow: '0 8px 24px rgba(30, 41, 59, 0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!hideHeader ? (
        <Box
          sx={{
            px: { xs: 1.5, xl: 2 },
            py: { xs: 1, xl: 1.25 },
            borderBottom: BORDER,
            bgcolor: HEADER_BG,
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xl: '1rem' } }}>
            {pump ? `${pump.manufacturer} — ${pump.name}` : 'Точки кривой'}
          </Typography>
          {!pump && (
            <Typography variant="caption" color="text.secondary">
              Выберите насос в таблице слева
            </Typography>
          )}
        </Box>
      ) : null}

      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.6)',
              zIndex: 2,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
        <Table
          size="small"
          sx={{
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            width: '100%',
            '& .MuiTableCell-root': { borderColor: 'rgba(30, 41, 59, 0.12)' },
          }}
        >
          <colgroup>
            <col style={{ width: canEdit ? '28%' : '34%' }} />
            <col style={{ width: canEdit ? '28%' : '33%' }} />
            <col style={{ width: canEdit ? '28%' : '33%' }} />
            {canEdit ? <col style={{ width: '16%' }} /> : null}
          </colgroup>
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              bgcolor: HEADER_BG,
              boxShadow: '0 2px 8px rgba(30, 41, 59, 0.12)',
            }}
          >
            <TableRow>
              <TableCell sx={headerCellSx}>Расход, м³/ч</TableCell>
              <TableCell sx={headerCellSx}>Напор, м</TableCell>
              <TableCell sx={headerCellSx}>КПД, %</TableCell>
              {canEdit ? <TableCell sx={headerCellSx} /> : null}
            </TableRow>
          </TableHead>
          <TableBody sx={{ bgcolor: 'background.paper' }}>
            {pump && curvePoints.length === 0 && !loading && (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 4 : 3}
                  sx={{ ...cellSx, py: 2, color: 'text.secondary' }}
                >
                  Нет точек кривой
                </TableCell>
              </TableRow>
            )}
            {curvePoints.map((row, index) => (
              <TableRow
                key={`${row.id}-${index}`}
                hover
                sx={{
                  '&:nth-of-type(even) .MuiTableCell-root': {
                    bgcolor: '#fcfdff',
                  },
                  '&:hover .MuiTableCell-root': {
                    bgcolor: '#eef5ff',
                  },
                }}
              >
                <TableCell sx={cellSx}>{fmt(row.rate)}</TableCell>
                <TableCell sx={cellSx}>{fmt(row.head)}</TableCell>
                <TableCell sx={cellSx}>{fmt(row.efficiency)}</TableCell>
                {canEdit ? (
                  <TableCell sx={cellSx}>
                    <Tooltip title="Действия">
                      <span>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, index)}
                          sx={{ p: 0.25 }}
                        >
                          <EllipsisVertical size={14} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          borderTop: BORDER,
          py: 1,
          px: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: 'background.paper',
        }}
      >
        {canEdit && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Добавить строку">
              <span>
                <IconButton size="small" onClick={addRow} disabled={savingCurve}>
                  <Plus size={18} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Очистить все">
              <span>
                <IconButton
                  size="small"
                  onClick={clearAll}
                  disabled={savingCurve || curvePoints.length === 0}
                >
                  <BrushCleaning size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}
        {canEdit && pump && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            disabled={!dirty || savingCurve}
            onClick={() => void onSaveCurvePoints()}
          >
            {savingCurve ? 'Сохранение…' : 'Сохранить точки'}
          </Button>
        )}
      </Box>

      <Menu anchorEl={menuAnchorEl} open={menuOpen} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            if (menuIndex !== null) openEdit(menuIndex);
            handleCloseMenu();
          }}
        >
          <Pencil size={14} style={{ marginRight: 8 }} />
          Редактировать
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuIndex !== null) deleteRow(menuIndex);
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={14} style={{ marginRight: 8 }} />
          Удалить
        </MenuItem>
      </Menu>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: '10px' }}>Точка кривой</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, overflow: 'visible' }}>
          <TextField
            label="Расход, м³/ч"
            value={editRate}
            onChange={(e) => setEditRate(e.target.value)}
            onBlur={() => setEditTouched((prev) => ({ ...prev, rate: true }))}
            size="small"
            fullWidth
            error={shouldShowRateError}
            helperText={shouldShowRateError ? 'Значение должно быть больше или равно 0' : undefined}
          />
          <TextField
            label="Напор, м"
            value={editHead}
            onChange={(e) => setEditHead(e.target.value)}
            onBlur={() => setEditTouched((prev) => ({ ...prev, head: true }))}
            size="small"
            fullWidth
            error={shouldShowHeadError}
            helperText={shouldShowHeadError ? 'Значение должно быть больше или равно 0' : undefined}
          />
          <TextField
            label="КПД, %"
            value={editEff}
            onChange={(e) => setEditEff(e.target.value)}
            onBlur={() => setEditTouched((prev) => ({ ...prev, efficiency: true }))}
            size="small"
            fullWidth
            error={shouldShowEfficiencyError}
            helperText={shouldShowEfficiencyError ? 'Значение должно быть от 0 до 100' : undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={applyEdit}>
            Применить
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
}
