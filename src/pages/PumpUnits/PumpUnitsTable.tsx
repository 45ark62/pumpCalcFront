import {
  Checkbox,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { PumpDto } from "entities/pumpDatabase/types/pumpTypes";
import type {
  PumpAssemblyRow,
  PumpCorrectionType,
} from "entities/pumpUnits/types/pumpAssemblyTypes";
import { useState } from "react";

const BORDER = "1px solid rgba(30, 41, 59, 0.12)";
const HEADER_BG = "#dbeafe";
const TABLE_MAX_HEIGHT = { xs: 360, md: 460, lg: "calc(100vh - 330px)" } as const;

/** Ширины колонок (12 шт., сумма ≈ 100%). Первая — узкая (номер / служебная). */
const COL_W = [
  "40px",
  "10%",
  "8.82%",
  "8.82%",
  "8.82%",
  "8.82%",
  "8.82%",
  "8.82%",
  "8.82%",
  "8.82%",
  "8.82%",
  "8.82%",
] as const;

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
  overflow: "visible",
} as const;

const headerCellSx = {
  ...cellSx,
  bgcolor: HEADER_BG,
  fontWeight: 700,
  fontSize: "0.74rem",
  lineHeight: 1.2,
  overflow: "visible",
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  hyphens: "auto",
} as const;

const subHeaderCellSx = {
  ...headerCellSx,
  p: 0.125,
  fontSize: "0.71rem",
  lineHeight: 1.15,
  wordBreak: "break-word",
  overflowWrap: "break-word",
  hyphens: "auto",
} as const;

const selectSx = {
  width: "100%",
  minWidth: 0,
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& .MuiSelect-select": {
    fontSize: "0.71rem",
    py: 0,
    minHeight: "24px",
    lineHeight: 1.1,
  },
} as const;

const flatInputSx = {
  width: "100%",
  "& .MuiInputBase-root": {
    height: 26,
    borderRadius: 0.5,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& .MuiInputBase-input": {
    fontSize: "0.71rem",
    textAlign: "center",
    py: 0,
    lineHeight: 1.1,
  },
} as const;

function fmt(n: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 6 }).format(n);
}

type Props = {
  data: PumpAssemblyRow[];
  allPumps: PumpDto[];
  manufacturers: string[];
  selectedPumpId: number | null;
  onSelectPump: (id: number) => void;
  onToggleChecked: (rowId: number, checked: boolean) => void;
  /** Чекбокс в шапке первой колонки: выбрать / снять все строки. */
  onToggleAllChecked: (checked: boolean) => void;
  onManufacturerChange: (rowId: number, manufacturer: string) => void;
  onMarkChange: (rowId: number, pumpId: number) => void;
  onCorrectionTypeChange: (rowId: number, value: PumpCorrectionType) => void;
  onCurrentFrequencyChange: (rowId: number, value: number) => void;
  onHeadCorrectionChange: (rowId: number, value: number) => void;
  onEfficiencyCorrectionChange: (rowId: number, value: number) => void;
  onWheelDiameterChange: (rowId: number, value: number) => void;
  onImpellerBladeWidthChange: (rowId: number, value: number) => void;
  onInflowsCountChange: (rowId: number, value: number) => void;
  onStepsCountChange: (rowId: number, value: number) => void;
};

export default function PumpUnitsTable({
  data,
  allPumps,
  manufacturers,
  selectedPumpId,
  onSelectPump,
  onToggleChecked,
  onToggleAllChecked,
  onManufacturerChange,
  onMarkChange,
  onCorrectionTypeChange,
  onCurrentFrequencyChange,
  onHeadCorrectionChange,
  onEfficiencyCorrectionChange,
  onWheelDiameterChange,
  onImpellerBladeWidthChange,
  onInflowsCountChange,
  onStepsCountChange,
}: Props) {
  const [draftByKey, setDraftByKey] = useState<Record<string, string>>({});

  const marksByManufacturer = (manufacturer: string) =>
    allPumps.filter((p) => p.manufacturer === manufacturer);

  const parseNumber = (value: string): number => {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const setDraft = (key: string, value: string) => {
    setDraftByKey((prev) => ({ ...prev, [key]: value }));
  };

  const clearDraft = (key: string) => {
    setDraftByKey((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onNumericChange = (key: string, nextRaw: string, onCommit: (value: number) => void) => {
    // Allow temporary empty value and decimal typing state.
    if (!/^-?\d*([.,]\d*)?$/.test(nextRaw)) return;
    setDraft(key, nextRaw);
    if (nextRaw === "" || nextRaw === "-" || nextRaw === "." || nextRaw === ",") return;
    onCommit(parseNumber(nextRaw));
  };

  const onNumericBlur = (key: string, onCommit: (value: number) => void) => {
    const raw = draftByKey[key];
    if (raw === undefined) return;
    if (raw === "" || raw === "-" || raw === "." || raw === ",") {
      onCommit(0);
      clearDraft(key);
      return;
    }
    onCommit(parseNumber(raw));
    clearDraft(key);
  };

  const allRowsChecked = data.length > 0 && data.every((r) => r.checked);
  const someRowsChecked = data.some((r) => r.checked);

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
        flexShrink: 0,
        bgcolor: "#f8fbff",
        boxShadow: "0 8px 24px rgba(30, 41, 59, 0.08)",
        WebkitOverflowScrolling: "touch",
      }}>
      <Table
        size="small"
        sx={{
          borderCollapse: "collapse",
          borderSpacing: 0,
          tableLayout: "fixed",
          width: "100%",
          border: "none",
          "& .MuiTableCell-root": {
            borderColor: "rgba(30, 41, 59, 0.12)",
            padding: 0,
            fontSize: { xs: "0.75rem", xl: "0.8125rem" },
          },
          "& thead .MuiTableCell-root": {
            backgroundClip: "padding-box",
          },
        }}>
        <colgroup>
          {COL_W.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <TableHead
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 3,
            bgcolor: HEADER_BG,
            boxShadow: "0 2px 8px rgba(30, 41, 59, 0.12)",
          }}>
          <TableRow sx={{ bgcolor: HEADER_BG }}>
            <TableCell colSpan={7} sx={headerCellSx}>
              Насосы
            </TableCell>
            <TableCell colSpan={5} sx={headerCellSx}></TableCell>
          </TableRow>
          <TableRow sx={{ bgcolor: HEADER_BG }}>
            <TableCell
              rowSpan={2}
              sx={{
                ...subHeaderCellSx,
                width: "3%",
                maxWidth: 48,
                p: 0.25,
                verticalAlign: "middle",
              }}>
              <Checkbox
                size="small"
                checked={allRowsChecked}
                indeterminate={someRowsChecked && !allRowsChecked}
                onChange={(e) => onToggleAllChecked(e.target.checked)}
                inputProps={{ "aria-label": "Выбрать все насосы для расчёта" }}
              />
            </TableCell>
            <TableCell rowSpan={2} sx={subHeaderCellSx}>
              Производитель
            </TableCell>
            <TableCell rowSpan={2} sx={subHeaderCellSx}>
              Марка
            </TableCell>
            <TableCell rowSpan={2} sx={subHeaderCellSx}>
              Паспортная частота, Гц
            </TableCell>
            <TableCell rowSpan={2} sx={subHeaderCellSx}>
              Рабочая частота, Гц
            </TableCell>
            <TableCell colSpan={2} sx={subHeaderCellSx}>
              Коррекция
            </TableCell>
            <TableCell rowSpan={2} sx={subHeaderCellSx}>
              Тип
            </TableCell>
            <TableCell rowSpan={2} sx={subHeaderCellSx}>
              Внешний диаметр рабочего колеса
            </TableCell>
            <TableCell rowSpan={2} sx={subHeaderCellSx}>
              Ширина лопатки
            </TableCell>
            <TableCell rowSpan={2} sx={subHeaderCellSx}>
              Количество сторон всасывания
            </TableCell>
            <TableCell rowSpan={2} sx={subHeaderCellSx}>
              Количество ступеней
            </TableCell>
          </TableRow>
          <TableRow sx={{ bgcolor: HEADER_BG }}>
            <TableCell sx={subHeaderCellSx}>Напор</TableCell>
            <TableCell sx={subHeaderCellSx}>КПД</TableCell>
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
                    "&:hover": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.22),
                    },
                  },
                  "& .MuiTableCell-root": {
                    color: "#1e3a8a",
                    fontWeight: 600,
                  },
                }),
              }}
            >
              <TableCell sx={cellSx}>
                <Checkbox
                  checked={row.checked}
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onToggleChecked(row.rowId, e.target.checked)}
                />
              </TableCell>
              <TableCell sx={cellSx}>
                <Select
                  size="small"
                  displayEmpty
                  value={row.manufacturer}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onManufacturerChange(row.rowId, String(e.target.value))}
                  sx={selectSx}
                >
                  <MenuItem value="" sx={{ fontSize: "0.6875rem" }}>
                    —
                  </MenuItem>
                  {manufacturers.map((manufacturer) => (
                    <MenuItem key={manufacturer} value={manufacturer} sx={{ fontSize: "0.6875rem" }}>
                      {manufacturer}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={cellSx}>
                <Select
                  size="small"
                  displayEmpty
                  value={row.id > 0 ? row.id : ""}
                  disabled={!row.manufacturer}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onMarkChange(row.rowId, Number(e.target.value))}
                  sx={selectSx}
                >
                  <MenuItem value="" sx={{ fontSize: "0.6875rem" }}>
                    —
                  </MenuItem>
                  {marksByManufacturer(row.manufacturer).map((pump) => (
                    <MenuItem key={pump.id} value={pump.id} sx={{ fontSize: "0.6875rem" }}>
                      {pump.name}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={cellSx}>{fmt(row.passportImpellerFrequency)}</TableCell>
              <TableCell sx={cellSx}>
                <TextField
                  size="small"
                  type="text"
                  inputMode="decimal"
                  value={
                    draftByKey[`currentImpellerFrequency:${row.rowId}`] ??
                    String(row.currentImpellerFrequency)
                  }
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onNumericChange(
                      `currentImpellerFrequency:${row.rowId}`,
                      e.target.value,
                      (v) => onCurrentFrequencyChange(row.rowId, v)
                    )
                  }
                  onBlur={() =>
                    onNumericBlur(`currentImpellerFrequency:${row.rowId}`, (v) =>
                      onCurrentFrequencyChange(row.rowId, v)
                    )
                  }
                  sx={flatInputSx}
                />
              </TableCell>
              <TableCell sx={cellSx}>
                <TextField
                  size="small"
                  type="text"
                  inputMode="decimal"
                  value={draftByKey[`headCorrection:${row.rowId}`] ?? String(row.headCorrection)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onNumericChange(`headCorrection:${row.rowId}`, e.target.value, (v) =>
                      onHeadCorrectionChange(row.rowId, v)
                    )
                  }
                  onBlur={() =>
                    onNumericBlur(`headCorrection:${row.rowId}`, (v) =>
                      onHeadCorrectionChange(row.rowId, v)
                    )
                  }
                  sx={flatInputSx}
                />
              </TableCell>
              <TableCell sx={cellSx}>
                <TextField
                  size="small"
                  type="text"
                  inputMode="decimal"
                  value={
                    draftByKey[`efficiencyCorrection:${row.rowId}`] ??
                    String(row.efficiencyCorrection)
                  }
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onNumericChange(`efficiencyCorrection:${row.rowId}`, e.target.value, (v) =>
                      onEfficiencyCorrectionChange(row.rowId, v)
                    )
                  }
                  onBlur={() =>
                    onNumericBlur(`efficiencyCorrection:${row.rowId}`, (v) =>
                      onEfficiencyCorrectionChange(row.rowId, v)
                    )
                  }
                  sx={flatInputSx}
                />
              </TableCell>
              <TableCell sx={cellSx}>
                <Select
                  size="small"
                  value={row.correctionType}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onCorrectionTypeChange(row.rowId, e.target.value as PumpCorrectionType)
                  }
                  sx={selectSx}
                >
                  <MenuItem value="single" sx={{ fontSize: "0.6875rem" }}>
                    односторонний
                  </MenuItem>
                  <MenuItem value="mainline" sx={{ fontSize: "0.6875rem" }}>
                    магистральный
                  </MenuItem>
                </Select>
              </TableCell>
              <TableCell sx={cellSx}>
                <TextField
                  size="small"
                  type="text"
                  inputMode="decimal"
                  value={draftByKey[`wheelDiameter:${row.rowId}`] ?? String(row.wheelDiameter)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onNumericChange(`wheelDiameter:${row.rowId}`, e.target.value, (v) =>
                      onWheelDiameterChange(row.rowId, v)
                    )
                  }
                  onBlur={() =>
                    onNumericBlur(`wheelDiameter:${row.rowId}`, (v) =>
                      onWheelDiameterChange(row.rowId, v)
                    )
                  }
                  sx={flatInputSx}
                />
              </TableCell>
              <TableCell sx={cellSx}>
                <TextField
                  size="small"
                  type="text"
                  inputMode="decimal"
                  value={
                    draftByKey[`impellerBladeWidth:${row.rowId}`] ?? String(row.impellerBladeWidth)
                  }
                  disabled={row.correctionType !== "single"}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onNumericChange(`impellerBladeWidth:${row.rowId}`, e.target.value, (v) =>
                      onImpellerBladeWidthChange(row.rowId, v)
                    )
                  }
                  onBlur={() =>
                    onNumericBlur(`impellerBladeWidth:${row.rowId}`, (v) =>
                      onImpellerBladeWidthChange(row.rowId, v)
                    )
                  }
                  sx={flatInputSx}
                />
              </TableCell>
              <TableCell sx={cellSx}>
                <TextField
                  size="small"
                  type="text"
                  inputMode="decimal"
                  value={draftByKey[`inflowsCount:${row.rowId}`] ?? String(row.inflowsCount)}
                  disabled={row.correctionType !== "mainline"}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onNumericChange(`inflowsCount:${row.rowId}`, e.target.value, (v) =>
                      onInflowsCountChange(row.rowId, v)
                    )
                  }
                  onBlur={() =>
                    onNumericBlur(`inflowsCount:${row.rowId}`, (v) =>
                      onInflowsCountChange(row.rowId, v)
                    )
                  }
                  sx={flatInputSx}
                />
              </TableCell>
              <TableCell sx={cellSx}>
                <TextField
                  size="small"
                  type="text"
                  inputMode="decimal"
                  value={draftByKey[`stepsCount:${row.rowId}`] ?? String(row.stepsCount)}
                  disabled={row.correctionType !== "mainline"}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onNumericChange(`stepsCount:${row.rowId}`, e.target.value, (v) =>
                      onStepsCountChange(row.rowId, v)
                    )
                  }
                  onBlur={() =>
                    onNumericBlur(`stepsCount:${row.rowId}`, (v) =>
                      onStepsCountChange(row.rowId, v)
                    )
                  }
                  sx={flatInputSx}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
