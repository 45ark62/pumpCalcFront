import {
  Box,
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
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import type { PumpDto } from 'entities/pumpDatabase/types/pumpTypes';

const BORDER = '1px solid rgba(30, 41, 59, 0.12)';
const HEADER_BG = '#dbeafe';
const TABLE_MAX_HEIGHT = { xs: 360, md: 500, lg: 'calc(100vh - 280px)' } as const;

/** Адаптивные ширины колонок (сумма = 100%) */
const COL_W = ['14%', '9%', '11%', '11%', '11%', '11%', '11%', '16%', '6%'] as const;

const cellSx = {
  border: BORDER,
  borderColor: 'rgba(30, 41, 59, 0.12)',
  textAlign: 'center',
  verticalAlign: 'middle',
  p: 0.125,
  fontSize: '0.72rem',
  lineHeight: 1.2,
  bgcolor: 'background.paper',
  boxSizing: 'border-box',
  overflow: 'visible',
} as const;

const headerCellSx = {
  ...cellSx,
  bgcolor: HEADER_BG,
  fontWeight: 700,
  fontSize: '0.74rem',
  lineHeight: 1.2,
  overflow: 'visible',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  hyphens: 'auto',
} as const;

const subHeaderCellSx = {
  ...headerCellSx,
  p: 0.125,
  fontSize: '0.71rem',
  lineHeight: 1.15,
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  hyphens: 'auto',
} as const;

/** Угол шапки (rowSpan=2) */
const rowspanHeaderCellSx = {
  ...headerCellSx,
  fontSize: subHeaderCellSx.fontSize,
  lineHeight: subHeaderCellSx.lineHeight,
} as const;

function fmt(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 6 }).format(n);
}

/** Подпись колонки «Источник» — при необходимости поменять правило под бэкенд */
function pumpSourceLabel(userId: number): string {
  return userId === 0 ? 'База данных' : 'Пользовательский';
}

type Props = {
  data: PumpDto[];
  deletingId: number | null;
  selectedPumpId: number | null;
  onSelectPump: (id: number) => void;
  onEdit: (pump: PumpDto) => void;
  onDelete: (id: number) => void | Promise<void>;
};

export default function PumpDatabaseTable({
  data,
  deletingId,
  selectedPumpId,
  onSelectPump,
  onEdit,
  onDelete,
}: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPump, setMenuPump] = useState<PumpDto | null>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>, pump: PumpDto) => {
    setMenuAnchorEl(e.currentTarget);
    setMenuPump(pump);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuPump(null);
  };

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
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Table
        size="small"
        sx={{
          borderCollapse: 'collapse',
          borderSpacing: 0,
          tableLayout: 'fixed',
          width: '100%',
          border: 'none',
          '& .MuiTableCell-root': {
            borderColor: 'rgba(30, 41, 59, 0.12)',
            padding: 0,
            fontSize: { xs: '0.75rem', xl: '0.8125rem' },
          },
          '& thead .MuiTableCell-root': {
            backgroundClip: 'padding-box',
          },
        }}
      >
        <colgroup>
          {COL_W.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <TableHead
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 3,
            bgcolor: HEADER_BG,
            boxShadow: '0 2px 8px rgba(30, 41, 59, 0.12)',
          }}
        >
          <TableRow sx={{ bgcolor: HEADER_BG }}>
            <TableCell rowSpan={2} sx={rowspanHeaderCellSx}>
              Производитель
            </TableCell>
            <TableCell rowSpan={2} sx={rowspanHeaderCellSx}>
              Модель
            </TableCell>
            <TableCell colSpan={3} sx={headerCellSx}>
              Оптимальные параметры
            </TableCell>
            <TableCell colSpan={2} sx={headerCellSx}>
              Рабочая область
            </TableCell>
            <TableCell rowSpan={2} sx={rowspanHeaderCellSx}>
              Источник насоса
            </TableCell>
            <TableCell
              rowSpan={2}
              sx={{
                ...rowspanHeaderCellSx,
                p: 0.5,
                verticalAlign: 'middle',
              }}
            >
              <Tooltip title="Действия">
                <Box
                  component="span"
                  aria-label="Действия"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <EllipsisVertical size={14} strokeWidth={2.25} aria-hidden />
                </Box>
              </Tooltip>
            </TableCell>
          </TableRow>
          <TableRow sx={{ bgcolor: HEADER_BG }}>
            <TableCell sx={subHeaderCellSx}>
              Частота вращения рабочего колеса, Гц
            </TableCell>
            <TableCell sx={subHeaderCellSx}>Подача, м³/час</TableCell>
            <TableCell sx={subHeaderCellSx}>Напор, м</TableCell>
            <TableCell sx={subHeaderCellSx}>Минимальный расход, м³/час</TableCell>
            <TableCell sx={subHeaderCellSx}>Максимальный расход, м³/час</TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ bgcolor: 'background.paper' }}>
          {data.map((row) => (
            <TableRow
              key={row.id}
              hover
              selected={selectedPumpId === row.id}
              onClick={() => onSelectPump(row.id)}
              sx={{
                '&:nth-of-type(even) .MuiTableCell-root': {
                  bgcolor: '#fcfdff',
                },
                '&:hover .MuiTableCell-root': {
                  bgcolor: '#eef5ff',
                },
                ...(selectedPumpId === row.id && {
                  '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.22),
                    },
                  },
                  '& .MuiTableCell-root': {
                    color: '#1e3a8a',
                    fontWeight: 600,
                  },
                }),
              }}
            >
              <TableCell sx={cellSx}>{row.manufacturer}</TableCell>
              <TableCell sx={cellSx}>{row.name}</TableCell>
              <TableCell sx={cellSx}>{fmt(row.impellerFrequency)}</TableCell>
              <TableCell sx={cellSx}>{fmt(row.supply)}</TableCell>
              <TableCell sx={cellSx}>{fmt(row.head)}</TableCell>
              <TableCell sx={cellSx}>{fmt(row.minRate)}</TableCell>
              <TableCell sx={cellSx}>{fmt(row.maxRate)}</TableCell>
              <TableCell sx={cellSx}>{pumpSourceLabel(row.userId)}</TableCell>
              <TableCell sx={cellSx}>
                {row.userId !== 0 ? (
                  <Tooltip title="Действия">
                    <span>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMenu(e, row);
                        }}
                        sx={{ p: 0.25, borderRadius: 1 }}
                      >
                        <EllipsisVertical size={14} />
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Menu anchorEl={menuAnchorEl} open={menuOpen} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            if (!menuPump) return;
            onEdit(menuPump);
            handleCloseMenu();
          }}
        >
          <Pencil size={14} style={{ marginRight: 8 }} />
          Редактировать
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!menuPump) return;
            void onDelete(menuPump.id);
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
          disabled={menuPump ? deletingId === menuPump.id : false}
        >
          <Trash2 size={14} style={{ marginRight: 8 }} />
          Удалить
        </MenuItem>
      </Menu>
    </TableContainer>
  );
}
