import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useStore } from "app/store/useStore";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import PumpUnitsSelectionTable from "./PumpUnitsSelectionTable";
import type { PumpAssemblyAdjustRequest } from "entities/pumpUnitsSelection/api/pumpUnitsSelectionApi";
import type { PumpAssemblyRow } from "entities/pumpUnits/types/pumpAssemblyTypes";

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const PumpUnitSelectionPage = observer(() => {
  const { pumpDatabaseStore, pumpUnitsStore, pumpUnitsSelectionStore, uiStore } = useStore();
  const [criterion, setCriterion] = useState<"head" | "pressure">("head");
  const [maxDeviation, setMaxDeviation] = useState(5);
  const [headDeviation, setHeadDeviation] = useState(5);
  const [pressureDeviation, setPressureDeviation] = useState(5);
  const [useHeadCorrection, setUseHeadCorrection] = useState(true);
  const [usePassportFrequency, setUsePassportFrequency] = useState(true);
  const [maxParallel, setMaxParallel] = useState(3);
  const [maxSequential, setMaxSequential] = useState(3);
  const [autoSelect, setAutoSelect] = useState(true);
  const [resultRows, setResultRows] = useState<PumpAssemblyRow[]>([]);

  const asNum = (v: unknown, fallback = 0) =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;
  const asStr = (v: unknown) => (typeof v === "string" ? v : "");
  const mapResultToRow = (item: unknown, idx: number): PumpAssemblyRow => {
    const o = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const nestedCandidates = [
      o.pump,
      o.pumpDto,
      o.sourcePump,
      o.basePump,
      o.item,
      o.data,
    ].filter((v): v is Record<string, unknown> => Boolean(v && typeof v === "object"));
    const src = nestedCandidates[0] ?? o;

    return {
      rowId: idx + 1,
      checked: false,
      manufacturer: asStr(src.manufacturer),
      mark: asStr(src.mark ?? src.name),
      correctionType: asStr(o.correctionType ?? src.correctionType) === "mainline" ? "mainline" : "single",
      passportImpellerFrequency: asNum(
        src.passportImpellerFrequency,
        asNum(src.currentImpellerFrequency)
      ),
      id: asNum(src.id),
      currentImpellerFrequency: asNum(src.currentImpellerFrequency),
      headCorrection: asNum(o.headCorrection ?? src.headCorrection, 1),
      efficiencyCorrection: asNum(o.efficiencyCorrection ?? src.efficiencyCorrection, 1),
      typePump: asNum(o.typePump ?? src.typePump),
      wheelDiameter: asNum(o.wheelDiameter ?? src.wheelDiameter, 1),
      impellerBladeWidth: asNum(o.impellerBladeWidth ?? src.impellerBladeWidth),
      inflowsCount: asNum(o.inflowsCount ?? src.inflowsCount),
      stepsCount: asNum(o.stepsCount ?? o.count ?? src.stepsCount ?? src.count, 1),
    };
  };

  const extractResultArray = (result: unknown): unknown[] => {
    if (Array.isArray(result)) return result;
    if (!result || typeof result !== "object") return [];
    const o = result as Record<string, unknown>;
    const candidates = [
      o.results,
      o.items,
      o.configurations,
      o.pumpAssemblies,
      o.pumps,
      o.data,
    ];
    const arr = candidates.find((x) => Array.isArray(x));
    return Array.isArray(arr) ? arr : [];
  };

  useEffect(() => {
    void pumpDatabaseStore.fetchPumps();
  }, [pumpDatabaseStore]);

  useEffect(() => {
    if (!pumpDatabaseStore.pumps.length) return;
    pumpUnitsStore.enrichAssemblyRowsFromDatabase(pumpDatabaseStore.pumps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pumpDatabaseStore.pumps]);

  const hasSelectionResult = resultRows.length > 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        height: "100%",
        minHeight: 0,
        px: { xs: 1.5, md: 2.5, lg: 6 },
        py: { xs: 1.5, lg: 6 },
        maxWidth: { xl: 1920 },
        mx: "auto",
        width: 1,
        bgcolor: "#f6f9ff",
      }}>
      <Box
        sx={{
          border: "1px solid rgba(30, 41, 59, 0.1)",
          borderRadius: 2.5,
          p: { xs: 1.5, lg: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          bgcolor: "#ffffff",
          boxShadow: "0 8px 22px rgba(15, 23, 42, 0.07)",
        }}>
        <FormControlLabel
          control={<Checkbox size="small" checked={autoSelect} onChange={(e) => setAutoSelect(e.target.checked)} />}
          label={<Typography sx={{ fontSize: 12, fontWeight: 600 }}>Автоматический подбор НУ</Typography>}
          sx={{ mx: 0 }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.5fr 180px 2fr 180px" },
            rowGap: 1.25,
            columnGap: { xs: 1.25, lg: 8 },
            alignItems: "center",
          }}>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Расход, м3/ч</Typography>
          <TextField
            size="small"
            value={pumpUnitsStore.assemblyGvMix}
            onChange={(e) => pumpUnitsStore.setAssemblyGvMix(toNumber(e.target.value))}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            Максимальное отклонение от рабочей области, %
          </Typography>
          <TextField
            size="small"
            value={maxDeviation}
            onChange={(e) => setMaxDeviation(toNumber(e.target.value))}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.5fr 180px 2fr 180px" },
            rowGap: 1.25,
            columnGap: { xs: 1.25, lg: 8 },
            alignItems: "center",
          }}>
          <RadioGroup
            row
            value={criterion}
            onChange={(_, v) => setCriterion(v as "head" | "pressure")}
            sx={{ gap: 1 }}
          >
            <FormControlLabel
              value="head"
              control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: 12 }}>Напор, м</Typography>}
              sx={{ mr: 1 }}
            />
            <FormControlLabel
              value="pressure"
              control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: 12 }}>Перепад давления, бар</Typography>}
            />
          </RadioGroup>
          <TextField
            size="small"
            value={criterion === "head" ? pumpUnitsStore.assemblyRho : pumpUnitsStore.assemblyNu}
            onChange={(e) =>
              criterion === "head"
                ? pumpUnitsStore.setAssemblyRho(toNumber(e.target.value))
                : pumpUnitsStore.setAssemblyNu(toNumber(e.target.value))
            }
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {criterion === "head" ? "Максимальное отклонение по напору, %" : "Максимальное отклонение по давлению, %"}
          </Typography>
          <TextField
            size="small"
            value={criterion === "head" ? headDeviation : pressureDeviation}
            onChange={(e) =>
              criterion === "head" ? setHeadDeviation(toNumber(e.target.value)) : setPressureDeviation(toNumber(e.target.value))
            }
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.5fr 180px 2fr 180px" },
            rowGap: 1.25,
            columnGap: { xs: 1.25, lg: 8 },
            alignItems: "center",
          }}>
          <FormControlLabel
            control={<Checkbox size="small" checked={useHeadCorrection} onChange={(e) => setUseHeadCorrection(e.target.checked)} />}
            label={<Typography sx={{ fontSize: 12 }}>Коррекция напора</Typography>}
            sx={{ mx: 0 }}
          />
          <TextField
            size="small"
            value={1}
            disabled
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={autoSelect} onChange={(e) => setAutoSelect(e.target.checked)} />}
            label={<Typography sx={{ fontSize: 12 }}>Максимальное число параллельных насосов</Typography>}
            sx={{ mx: 0 }}
          />
          <TextField
            size="small"
            value={maxParallel}
            onChange={(e) => setMaxParallel(toNumber(e.target.value))}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.5fr 180px 2fr 180px" },
            rowGap: 1.25,
            columnGap: { xs: 1.25, lg: 8 },
            alignItems: "center",
          }}>
          <FormControlLabel
            control={<Checkbox size="small" checked={usePassportFrequency} onChange={(e) => setUsePassportFrequency(e.target.checked)} />}
            label={<Typography sx={{ fontSize: 12 }}>Паспортная частота, Гц</Typography>}
            sx={{ mx: 0 }}
          />
          <TextField
            size="small"
            value={50}
            disabled
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={autoSelect} onChange={(e) => setAutoSelect(e.target.checked)} />}
            label={<Typography sx={{ fontSize: 12 }}>Максимальное число последовательных насосов</Typography>}
            sx={{ mx: 0 }}
          />
          <TextField
            size="small"
            value={maxSequential}
            onChange={(e) => setMaxSequential(toNumber(e.target.value))}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", pt: 0.75 }}>
            <Button
              size="small"
              variant="contained"
              disabled={pumpUnitsSelectionStore.loading}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 700,
                px: 2.25,
                bgcolor: "#1a365d",
                "&:hover": { bgcolor: "#132a47" },
              }}
              onClick={async () => {
                const body: PumpAssemblyAdjustRequest = {
                  rate: pumpUnitsStore.assemblyGvMix,
                  workingAreaDelta: maxDeviation,
                  useHead: criterion === "head",
                  head: pumpUnitsStore.assemblyRho,
                  headDelta: headDeviation,
                  deltaPressure: pumpUnitsStore.assemblyNu,
                  maxPressureDelta: pressureDeviation,
                  enviromentDensity: pumpUnitsStore.assemblyRho,
                  setHeadCorrection: useHeadCorrection,
                  setPassportImpellerFrequency: usePassportFrequency,
                  passportImpellerFrequency: 50,
                  headCorrection: useHeadCorrection ? 1 : 0,
                  parallelPumpsMaxCount: maxParallel,
                  serialPumpsMaxCount: maxSequential,
                  setParallelPumpsMaxCount: autoSelect,
                  setSerialPumpsMaxCount: autoSelect,
                };
                try {
                  const result = await pumpUnitsSelectionStore.calculate(body);
                  const rows = extractResultArray(result).map(mapResultToRow);
                  setResultRows(rows);
                } catch {
                  setResultRows([]);
                }
              }}
            >
              {pumpUnitsSelectionStore.loading ? "Подбор..." : "Запустить подбор"}
            </Button>
        </Box>
      </Box>

      {hasSelectionResult && (
        <>
          <Typography sx={{ fontSize: 14, fontWeight: 600, mt: 0.25 }}>Результаты</Typography>

          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ flex: 1, minHeight: 180 }}>
              <PumpUnitsSelectionTable
                data={resultRows}
                selectedPumpId={resultRows.find((r) => r.checked)?.rowId ?? null}
                onSelectPump={(id) =>
                  setResultRows((prev) =>
                    prev.map((r) => ({ ...r, checked: r.rowId === id ? r.checked : false }))
                  )
                }
                onToggleChecked={(rowId, checked) =>
                  setResultRows((prev) =>
                    prev.map((r) => ({ ...r, checked: r.rowId === rowId ? checked : false }))
                  )
                }
                onToggleAllChecked={(checked) =>
                  setResultRows((prev) => prev.map((r) => ({ ...r, checked })))
                }
                onQuantityChange={(rowId, value) =>
                  setResultRows((prev) =>
                    prev.map((r) => (r.rowId === rowId ? { ...r, stepsCount: value } : r))
                  )
                }
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const selected = resultRows.filter((r) => r.checked);
                  if (!selected.length) {
                    uiStore.showError("Выберите конфигурацию для применения");
                    return;
                  }
                  const added = pumpUnitsStore.applySelectionRowsToAssembly(selected);
                  if (added > 0) {
                    uiStore.showWarning(
                      "Добавлена насосная установка. Для расчета перейдите на вкладку насосные установки"
                    );
                    setResultRows((prev) => prev.map((r) => ({ ...r, checked: false })));
                  }
                }}>
                Применить
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
});

export default PumpUnitSelectionPage;
