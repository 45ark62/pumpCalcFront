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
  const [headCorrectionValue, setHeadCorrectionValue] = useState(1);
  const [passportFrequencyValue, setPassportFrequencyValue] = useState(50);
  const [maxParallel, setMaxParallel] = useState(3);
  const [maxSequential, setMaxSequential] = useState(3);
  const [maxParallelChecked, setMaxParallelChecked] = useState(true);
  const [maxSequentialChecked, setMaxSequentialChecked] = useState(true);
  const [resultRows, setResultRows] = useState<PumpAssemblyRow[]>([]);
  const [touchedFields, setTouchedFields] = useState({
    rate: false,
    maxDeviation: false,
    head: false,
    pressure: false,
    headDeviation: false,
    pressureDeviation: false,
    headCorrection: false,
    passportFrequency: false,
    maxParallel: false,
    maxSequential: false,
  });

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
      impellerFrequency: asNum(
        src.passportImpellerFrequency ?? src.impellerFrequency,
        asNum(src.currentImpellerFrequency)
      ),
      id: asNum(src.id),
      currentImpellerFrequency: asNum(src.currentImpellerFrequency, asNum(src.impellerFrequency)),
      headCorrection: asNum(o.headCorrection ?? src.headCorrection, 1),
      efficiencyCorrection: asNum(o.efficiencyCorrection ?? src.efficiencyCorrection, 1),
      typePump: asNum(o.typePump ?? src.typePump),
      wheelDiameter: asNum(o.wheelDiameter ?? src.wheelDiameter, 1),
      impellerBladeWidth: asNum(o.impellerBladeWidth ?? src.impellerBladeWidth),
      inflowsCount: asNum(o.inflowsCount ?? src.inflowsCount),
      /** В таблице подбора — число одинаковых насосов в конфигурации (`count` с бэка). */
      stepsCount: asNum(o.count ?? o.stepsCount ?? src.stepsCount ?? src.count, 1),
      configuration: asNum(o.configuration ?? src.configuration),
    };
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
  const isRateValid = pumpUnitsStore.assemblyGvMix > 0;
  const isMaxDeviationValid = maxDeviation >= 0;
  const isHeadValid = pumpUnitsStore.assemblyRho > 0;
  const isPressureValid = pumpUnitsStore.assemblyNu > 0;
  const isHeadDeviationValid = headDeviation >= 0;
  const isPressureDeviationValid = pressureDeviation >= 0;
  const isHeadCorrectionValid = !useHeadCorrection || headCorrectionValue > 0;
  const isPassportFrequencyValid = !usePassportFrequency || passportFrequencyValue > 0;
  const isMaxParallelValid = !maxParallelChecked || maxParallel >= 2;
  const isMaxSequentialValid = !maxSequentialChecked || maxSequential >= 2;
  const isSelectionFormValid =
    isRateValid &&
    isMaxDeviationValid &&
    isHeadDeviationValid &&
    isPressureDeviationValid &&
    isHeadCorrectionValid &&
    isPassportFrequencyValid &&
    isMaxParallelValid &&
    isMaxSequentialValid &&
    (criterion === "head" ? isHeadValid : isPressureValid);
  const touchField = (field: keyof typeof touchedFields) =>
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  const touchAllFields = () =>
    setTouchedFields({
      rate: true,
      maxDeviation: true,
      head: true,
      pressure: true,
      headDeviation: true,
      pressureDeviation: true,
      headCorrection: true,
      passportFrequency: true,
      maxParallel: true,
      maxSequential: true,
    });

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
            onBlur={() => touchField("rate")}
            error={touchedFields.rate && !isRateValid}
            helperText={touchedFields.rate && !isRateValid ? "Расход должен быть больше 0" : undefined}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            Максимальное отклонение от рабочей области, %
          </Typography>
          <TextField
            size="small"
            value={maxDeviation}
            onChange={(e) => setMaxDeviation(toNumber(e.target.value))}
            onBlur={() => touchField("maxDeviation")}
            error={touchedFields.maxDeviation && !isMaxDeviationValid}
            helperText={
              touchedFields.maxDeviation && !isMaxDeviationValid ? "Максимальное отклонение должно быть не меньше 0" : undefined
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
            onBlur={() => touchField(criterion === "head" ? "head" : "pressure")}
            error={criterion === "head" ? touchedFields.head && !isHeadValid : touchedFields.pressure && !isPressureValid}
            helperText={
              criterion === "head"
                ? touchedFields.head && !isHeadValid
                  ? "Напор должен быть больше 0"
                  : undefined
                : touchedFields.pressure && !isPressureValid
                  ? "Перепад давления должен быть больше 0"
                  : undefined
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
            onBlur={() => touchField(criterion === "head" ? "headDeviation" : "pressureDeviation")}
            error={
              criterion === "head"
                ? touchedFields.headDeviation && !isHeadDeviationValid
                : touchedFields.pressureDeviation && !isPressureDeviationValid
            }
            helperText={
              criterion === "head"
                ? touchedFields.headDeviation && !isHeadDeviationValid
                  ? "Максимальное отклонение должно быть не меньше 0"
                  : undefined
                : touchedFields.pressureDeviation && !isPressureDeviationValid
                  ? "Максимальное отклонение должно быть не меньше 0"
                  : undefined
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
            value={headCorrectionValue}
            onChange={(e) => setHeadCorrectionValue(toNumber(e.target.value))}
            onBlur={() => touchField("headCorrection")}
            disabled={!useHeadCorrection}
            error={useHeadCorrection && touchedFields.headCorrection && !isHeadCorrectionValid}
            helperText={
              useHeadCorrection && touchedFields.headCorrection && !isHeadCorrectionValid
                ? "Коррекция напора должна быть больше 0"
                : undefined
            }
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={maxParallelChecked} onChange={(e) => setMaxParallelChecked(e.target.checked)} />}
            label={<Typography sx={{ fontSize: 12 }}>Максимальное число параллельных насосов</Typography>}
            sx={{ mx: 0 }}
          />
          <TextField
            size="small"
            disabled={!maxParallelChecked}
            value={maxParallel}
            onChange={(e) => setMaxParallel(toNumber(e.target.value))}
            onBlur={() => touchField("maxParallel")}
            error={maxParallelChecked && touchedFields.maxParallel && !isMaxParallelValid}
            helperText={
              maxParallelChecked && touchedFields.maxParallel && !isMaxParallelValid
                ? "Максимальное число параллельных насосов должно быть не меньше 2"
                : undefined
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
            control={<Checkbox size="small" checked={usePassportFrequency} onChange={(e) => setUsePassportFrequency(e.target.checked)} />}
            label={<Typography sx={{ fontSize: 12 }}>Паспортная частота, Гц</Typography>}
            sx={{ mx: 0 }}
          />
          <TextField
            size="small"
            value={passportFrequencyValue}
            onChange={(e) => setPassportFrequencyValue(toNumber(e.target.value))}
            onBlur={() => touchField("passportFrequency")}
            disabled={!usePassportFrequency}
            error={usePassportFrequency && touchedFields.passportFrequency && !isPassportFrequencyValid}
            helperText={
              usePassportFrequency && touchedFields.passportFrequency && !isPassportFrequencyValid
                ? "Паспортная частота должна быть больше 0"
                : undefined
            }
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={maxSequentialChecked} onChange={(e) => setMaxSequentialChecked(e.target.checked)} />}
            label={<Typography sx={{ fontSize: 12 }}>Максимальное число последовательных насосов</Typography>}
            sx={{ mx: 0 }}
          />
          <TextField
            size="small"
            disabled={!maxSequentialChecked}
            value={maxSequential}
            onChange={(e) => setMaxSequential(toNumber(e.target.value))}
            onBlur={() => touchField("maxSequential")}
            error={maxSequentialChecked && touchedFields.maxSequential && !isMaxSequentialValid}
            helperText={
              maxSequentialChecked && touchedFields.maxSequential && !isMaxSequentialValid
                ? "Максимальное число последовательных насосов должно быть не меньше 2"
                : undefined
            }
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fbff", borderRadius: 1.5 } }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", pt: 0.75 }}>
            <Button
              size="small"
              variant="contained"
              disabled={pumpUnitsSelectionStore.loading || !isSelectionFormValid}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 700,
                px: 2.25,
                bgcolor: "#1a365d",
                "&:hover": { bgcolor: "#132a47" },
              }}
              onClick={async () => {
                touchAllFields();
                if (!isSelectionFormValid) {
                  return;
                }
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
                  passportImpellerFrequency: passportFrequencyValue,
                  headCorrection: useHeadCorrection ? headCorrectionValue : 0,
                  parallelPumpsMaxCount: maxParallel,
                  serialPumpsMaxCount: maxSequential,
                  setParallelPumpsMaxCount: maxParallelChecked,
                  setSerialPumpsMaxCount: maxSequentialChecked,
                };
                try {
                  const result = await pumpUnitsSelectionStore.calculate(body);
                  //@ts-ignore
                  const rows = result.map(mapResultToRow);
                  console.log(rows);
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
                  const added = pumpUnitsStore.replaceAssemblyWithSelection(selected);
                  if (added > 0) {
                    uiStore.showWarning(
                      "Таблица насосной установки заменена выбранной конфигурацией подбора. Для расчёта перейдите на вкладку «Насосные установки»."
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
