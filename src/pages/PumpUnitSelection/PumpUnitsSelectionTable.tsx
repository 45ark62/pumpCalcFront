import {
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { PumpAssemblyRow } from "entities/pumpUnits/types/pumpAssemblyTypes";
import { useState } from "react";

const BORDER = "1px solid rgba(30, 41, 59, 0.12)";
const HEADER_BG = "#dbeafe";
const TABLE_MAX_HEIGHT = { xs: 320, md: 440, lg: "calc(100vh - 360px)" } as const;
const COL_W = ["40px", "17%", "10%", "24%", "24%", "25%"] as const;

const cellSx = {
  border: BORDER,
  borderColor: "rgba(30, 41, 59, 0.12)",
  textAlign: "center",
  verticalAlign: "middle",
  p: 0.125,
  fontSize: "0.72rem",
  lineHeight: 1.15,
  bgcolor: "background.paper",
  boxSizing: "border-box",
} as const;

const headerCellSx = {
  ...cellSx,
  bgcolor: HEADER_BG,
  fontWeight: 700,
  fontSize: "0.74rem",
  lineHeight: 1.2,
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflowWrap: "break-word",
} as const;

const flatInputSx = {
  width: "100%",
  "& .MuiInputBase-root": { height: 26, borderRadius: 0.5 },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiInputBase-input": { fontSize: "0.71rem", textAlign: "center", py: 0, lineHeight: 1.1 },
} as const;

function fmt(n: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 6 }).format(n);
}

function typeLabel(typePump: number): string {
  if (typePump === 1) return "Последовательная";
  if (typePump === 2) return "Параллельная";
  return "Одиночная";
}

type Props = {
  data: PumpAssemblyRow[];
  selectedPumpId: number | null;
  onSelectPump: (id: number) => void;
  onToggleChecked: (rowId: number, checked: boolean) => void;
  onToggleAllChecked: (checked: boolean) => void;
  onQuantityChange: (rowId: number, value: number) => void;
};

export default function PumpUnitsSelectionTable({
  data,
  selectedPumpId,
  onSelectPump,
  onToggleChecked,
  onToggleAllChecked,
  onQuantityChange,
}: Props) {
  const [draftQty, setDraftQty] = useState<Record<number, string>>({});

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        flex: 1,
        border: BORDER,
        borderRadius: 2,
        overflowY: "auto",
        overflowX: "hidden",
        maxHeight: TABLE_MAX_HEIGHT,
        scrollbarGutter: "stable",
        bgcolor: "#f8fbff",
        boxShadow: "0 8px 24px rgba(30, 41, 59, 0.08)",
      }}
    >
      <Table
        size="small"
        sx={{
          borderCollapse: "collapse",
          borderSpacing: 0,
          tableLayout: "fixed",
          width: "100%",
          "& .MuiTableCell-root": { borderColor: "rgba(30, 41, 59, 0.12)" },
        }}
      >
        <colgroup>{COL_W.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
        <TableHead
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: HEADER_BG,
            boxShadow: "0 2px 8px rgba(30, 41, 59, 0.12)",
          }}
        >
          <TableRow><TableCell colSpan={6} sx={headerCellSx}>Насосы</TableCell></TableRow>
          <TableRow>
            <TableCell sx={{ ...headerCellSx, p: 0.25 }}>
            </TableCell>
            <TableCell sx={headerCellSx}>Конфигурация</TableCell>
            <TableCell sx={headerCellSx}>Количество</TableCell>
            <TableCell sx={headerCellSx}>Производитель</TableCell>
            <TableCell sx={headerCellSx}>Марка</TableCell>
            <TableCell sx={headerCellSx}>Паспортная частота, Гц</TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ bgcolor: "background.paper" }}>
          {data.map((row) => (
            <TableRow
              key={row.rowId}
              hover
              selected={selectedPumpId === row.rowId}
              onClick={() => onSelectPump(row.rowId)}
              sx={{
                cursor: "pointer",
                "&:nth-of-type(even) .MuiTableCell-root": {
                  bgcolor: "#fcfdff",
                },
                "&:hover .MuiTableCell-root": {
                  bgcolor: "#eef5ff",
                },
                ...(selectedPumpId === row.rowId && {
                  "&.Mui-selected": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.22) },
                  },
                  "& .MuiTableCell-root": {
                    color: "#1e3a8a",
                    fontWeight: 600,
                  },
                }),
              }}
            >
              <TableCell sx={{ ...cellSx, p: 0.25 }}>
                <Radio
                  size="small"
                  checked={row.checked}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    if (!isChecked) {
                      onToggleChecked(row.rowId, false);
                      return;
                    }
                    // Radio behavior: only one row can stay selected.
                    onToggleAllChecked(false);
                    onToggleChecked(row.rowId, true);
                    onSelectPump(row.rowId);
                  }}
                />
              </TableCell>
              <TableCell sx={cellSx}>{typeLabel(row.typePump)}</TableCell>
              <TableCell sx={cellSx}>
                <TextField
                  size="small"
                  type="text"
                  inputMode="numeric"
                  value={draftQty[row.rowId] ?? String(Math.max(1, row.stepsCount || 1))}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    setDraftQty((prev) => ({ ...prev, [row.rowId]: raw }));
                    if (raw !== "") onQuantityChange(row.rowId, Number(raw));
                  }}
                  onBlur={() => {
                    const raw = draftQty[row.rowId];
                    if (raw === undefined) return;
                    const next = Math.max(1, Number(raw) || 1);
                    onQuantityChange(row.rowId, next);
                    setDraftQty((prev) => {
                      const copy = { ...prev };
                      delete copy[row.rowId];
                      return copy;
                    });
                  }}
                  sx={flatInputSx}
                />
              </TableCell>
              <TableCell sx={cellSx}>{row.manufacturer || "—"}</TableCell>
              <TableCell sx={cellSx}>{row.mark || "—"}</TableCell>
              <TableCell sx={cellSx}>{fmt(row.passportImpellerFrequency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
