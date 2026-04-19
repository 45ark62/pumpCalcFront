import { Box, Button, TextField } from "@mui/material";
import { useStore } from "app/store/useStore";
import {
  createEmptyPumpRow,
  DEFAULT_EFFICIENCY_CORRECTION,
  DEFAULT_HEAD_CORRECTION,
} from "entities/pumpUnits/model/pumpAssemblyDefaults";
import { observer } from "mobx-react-lite";
import PumpTypeSelect from "entities/pumpUnits/ui/PumpTypeSelect";
import type {
  PumpAssemblyCalculateRequest,
  PumpAssemblyPumpInput,
} from "entities/pumpUnits/types/pumpAssemblyTypes";
import { useCallback, useEffect, useMemo } from "react";
import PumpUnitsCharts from "./PumpUnitsCharts";
import PumpUnitsTable from "./PumpUnitsTable";

const NAV_DARKEST_BLUE = "#1a365d";

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const PumpUnitsPage = observer(() => {
  const { pumpDatabaseStore, pumpUnitsStore } = useStore();

  useEffect(() => {
    void pumpDatabaseStore.fetchPumps();
  }, [pumpDatabaseStore]);

  useEffect(() => {
    if (!pumpDatabaseStore.pumps.length) return;
    pumpUnitsStore.enrichAssemblyRowsFromDatabase(pumpDatabaseStore.pumps);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- обогащаем при загрузке/обновлении справочника насосов
  }, [pumpDatabaseStore.pumps]);

  const manufacturerOptions = useMemo(
    () => Array.from(new Set(pumpDatabaseStore.pumps.map((p) => p.manufacturer))).sort(),
    [pumpDatabaseStore.pumps]
  );

  const handleManufacturerChange = useCallback(
    (rowId: number, manufacturer: string) => {
      const row = pumpUnitsStore.assemblyPumps.find((x) => x.rowId === rowId);
      const base = createEmptyPumpRow(rowId);
      pumpUnitsStore.updateAssemblyRow(rowId, {
        ...base,
        rowId,
        checked: row?.checked ?? false,
        manufacturer,
      });
    },
    [pumpUnitsStore]
  );

  const handleMarkChange = useCallback(
    (rowId: number, pumpId: number) => {
      const selectedPump = pumpDatabaseStore.pumps.find((p) => p.id === pumpId);
      if (!selectedPump) return;
      pumpUnitsStore.updateAssemblyRow(rowId, {
        id: selectedPump.id,
        manufacturer: selectedPump.manufacturer,
        mark: selectedPump.name,
        impellerFrequency: selectedPump.impellerFrequency,
        currentImpellerFrequency: selectedPump.impellerFrequency,
        headCorrection: DEFAULT_HEAD_CORRECTION,
        efficiencyCorrection: DEFAULT_EFFICIENCY_CORRECTION,
        correctionType: "single",
        typePump: 0,
        wheelDiameter: 0,
        impellerBladeWidth: 0,
        inflowsCount: 0,
        stepsCount: 0,
      });
    },
    [pumpDatabaseStore.pumps, pumpUnitsStore]
  );

  const handleCorrectionTypeChange = useCallback(
    (rowId: number, correctionType: string) =>
      pumpUnitsStore.updateAssemblyRow(rowId, { correctionType }),
    [pumpUnitsStore]
  );

  const handleHeadCorrectionChange = useCallback(
    (rowId: number, value: number) => pumpUnitsStore.updateAssemblyRow(rowId, { headCorrection: value }),
    [pumpUnitsStore]
  );

  const handleEfficiencyCorrectionChange = useCallback(
    (rowId: number, value: number) =>
      pumpUnitsStore.updateAssemblyRow(rowId, { efficiencyCorrection: value }),
    [pumpUnitsStore]
  );

  const handleCurrentFrequencyChange = useCallback(
    (rowId: number, value: number) =>
      pumpUnitsStore.updateAssemblyRow(rowId, { currentImpellerFrequency: value }),
    [pumpUnitsStore]
  );

  const handleWheelDiameterChange = useCallback(
    (rowId: number, value: number) => pumpUnitsStore.updateAssemblyRow(rowId, { wheelDiameter: value }),
    [pumpUnitsStore]
  );

  const handleImpellerBladeWidthChange = useCallback(
    (rowId: number, value: number) =>
      pumpUnitsStore.updateAssemblyRow(rowId, { impellerBladeWidth: value }),
    [pumpUnitsStore]
  );

  const handleInflowsCountChange = useCallback(
    (rowId: number, value: number) => pumpUnitsStore.updateAssemblyRow(rowId, { inflowsCount: value }),
    [pumpUnitsStore]
  );

  const handleStepsCountChange = useCallback(
    (rowId: number, value: number) => pumpUnitsStore.updateAssemblyRow(rowId, { stepsCount: value }),
    [pumpUnitsStore]
  );

  const handleToggleChecked = useCallback(
    (rowId: number, checked: boolean) => pumpUnitsStore.toggleAssemblyRowChecked(rowId, checked),
    [pumpUnitsStore]
  );

  const handleToggleAllChecked = useCallback(
    (checked: boolean) => pumpUnitsStore.setAllAssemblyRowsChecked(checked),
    [pumpUnitsStore]
  );

  const handleCalculate = useCallback(async () => {
    const rowsPayload: PumpAssemblyPumpInput[] = pumpUnitsStore.assemblyPumps
      .filter((row) => row.checked && row.id > 0)
      .map((row) => ({
        id: row.id,
        currentImpellerFrequency: row.currentImpellerFrequency,
        headCorrection: row.headCorrection,
        efficiencyCorrection: row.efficiencyCorrection,
        typePump: row.typePump,
        wheelDiameter: row.wheelDiameter,
        impellerBladeWidth: row.impellerBladeWidth,
        inflowsCount: row.inflowsCount,
        stepsCount: row.stepsCount,
      }));

    const body: PumpAssemblyCalculateRequest = {
      connectionType: pumpUnitsStore.assemblyConnectionType,
      gv_mix: pumpUnitsStore.assemblyGvMix,
      nu: pumpUnitsStore.assemblyNu,
      rho: pumpUnitsStore.assemblyRho,
      pumps: rowsPayload,
    };

    try {
      await pumpUnitsStore.calculate(body);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("PumpAssembly calculate failed", e);
    }
  }, [pumpUnitsStore]);

  const canCalculate = pumpUnitsStore.assemblyPumps.some((row) => row.checked && row.id > 0);
  const hasCheckedRows = pumpUnitsStore.assemblyPumps.some((row) => row.checked);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        gap: 2,
        p: { xs: 1.5, lg: 2 },
        borderRadius: 3,
        overflowY: "auto",
        overflowX: "hidden",
      }}>
      <PumpTypeSelect
        connectionType={pumpUnitsStore.assemblyConnectionType}
        setConnectionType={(v) => pumpUnitsStore.setAssemblyConnectionType(v)}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => pumpUnitsStore.addAssemblyRow()}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 1.5,
            boxShadow: "0 4px 12px rgba(43, 108, 176, 0.28)",
          }}>
          Добавить
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          disabled={!hasCheckedRows}
          onClick={() => pumpUnitsStore.deleteCheckedAssemblyRows()}
          sx={{ textTransform: "none", borderRadius: 1.5, fontWeight: 600 }}>
          Удалить выбранное
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          gap: 2,
          flexDirection: { xs: "column", lg: "row" },
        }}>
        <Box
          sx={{
            flex: { xs: 1, lg: "0 0 60%" },
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minHeight: 0,
          }}>
          <Box
            sx={{
              flex: 1,
              minHeight: 260,
              maxHeight: { lg: "calc(100vh - 360px)" },
              p: 1,
              borderRadius: 2.5,
              bgcolor: "#ffffff",
              border: "1px solid rgba(30, 41, 59, 0.08)",
              boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
            }}>
            <PumpUnitsTable
              data={pumpUnitsStore.assemblyPumps}
              allPumps={pumpDatabaseStore.pumps}
              manufacturers={manufacturerOptions}
              selectedPumpId={pumpUnitsStore.assemblySelectedRowId}
              onSelectPump={(id) => pumpUnitsStore.setAssemblySelectedRowId(id)}
              onToggleChecked={handleToggleChecked}
              onToggleAllChecked={handleToggleAllChecked}
              onManufacturerChange={handleManufacturerChange}
              onMarkChange={handleMarkChange}
              onCorrectionTypeChange={handleCorrectionTypeChange}
              onCurrentFrequencyChange={handleCurrentFrequencyChange}
              onHeadCorrectionChange={handleHeadCorrectionChange}
              onEfficiencyCorrectionChange={handleEfficiencyCorrectionChange}
              onWheelDiameterChange={handleWheelDiameterChange}
              onImpellerBladeWidthChange={handleImpellerBladeWidthChange}
              onInflowsCountChange={handleInflowsCountChange}
              onStepsCountChange={handleStepsCountChange}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              flexShrink: 0,
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: "#ffffff",
              border: "1px solid rgba(30, 41, 59, 0.08)",
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.07)",
            }}>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
              Объёмный расход жидкости, м³/час:
              <TextField
                size="small"
                type="number"
                value={pumpUnitsStore.assemblyGvMix}
                onChange={(e) => pumpUnitsStore.setAssemblyGvMix(toNumber(e.target.value))}
                sx={{
                  minWidth: 210,
                  "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: "#f8fbff" },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
              Кинематическая вязкость жидкости, м²/сек:
              <TextField
                size="small"
                type="number"
                value={pumpUnitsStore.assemblyNu}
                onChange={(e) => pumpUnitsStore.setAssemblyNu(toNumber(e.target.value))}
                sx={{
                  minWidth: 210,
                  "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: "#f8fbff" },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
              Плотность жидкости, кг/м³:
              <TextField
                size="small"
                type="number"
                value={pumpUnitsStore.assemblyRho}
                onChange={(e) => pumpUnitsStore.setAssemblyRho(toNumber(e.target.value))}
                sx={{
                  minWidth: 210,
                  "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: "#f8fbff" },
                }}
              />
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={() => void handleCalculate()}
              disabled={pumpUnitsStore.loading || !canCalculate}
              sx={{
                mt: 0.5,
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: NAV_DARKEST_BLUE,
                boxShadow: "0 8px 18px rgba(26, 54, 93, 0.34)",
                "&:hover": {
                  bgcolor: "#132a47",
                  boxShadow: "0 10px 20px rgba(19, 42, 71, 0.4)",
                },
                "&.Mui-disabled": {
                  bgcolor: "rgba(26, 54, 93, 0.35)",
                  color: "rgba(255,255,255,0.72)",
                },
              }}>
              {pumpUnitsStore.loading ? "Расчёт..." : "Рассчитать"}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            display: "flex",
            p: 1,
            borderRadius: 2.5,
            border: "1px solid rgba(30, 41, 59, 0.08)",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
          }}>
          <PumpUnitsCharts result={pumpUnitsStore.result} />
        </Box>
      </Box>
    </Box>
  );
});

export default PumpUnitsPage;
