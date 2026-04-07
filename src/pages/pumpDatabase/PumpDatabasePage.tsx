import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "app/store/useStore";
import ConfirmDialog from "shared/components/ConfirmDialog";
import PumpFormDialog, {
  type PumpDraft,
} from "shared/components/PumpFormDialog";
import { pumpDatabaseApi } from "entities/pumpDatabase/api/pumpDatabaseApi";
import type {
  CurvePointDto,
  PumpDto,
} from "entities/pumpDatabase/types/pumpTypes";
import PumpCurveCharts from "./PumpCurveCharts";
import PumpCurvePointsTable from "./PumpCurvePointsTable";
import PumpDatabaseTable from "./PumpDatabaseTable";

const PumpDatabasePage = observer(function PumpDatabasePage() {
  const { pumpDatabaseStore } = useStore();
  const [sourceFilter, setSourceFilter] = useState<"all" | "user" | "db">(
    "all"
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPump, setEditingPump] = useState<PumpDto | null>(null);
  const [selectedPumpId, setSelectedPumpId] = useState<number | null>(null);
  const [detailPump, setDetailPump] = useState<PumpDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [curveDraft, setCurveDraft] = useState<CurvePointDto[]>([]);
  const [savingCurve, setSavingCurve] = useState(false);

  useEffect(() => {
    void pumpDatabaseStore.fetchPumps();
  }, [pumpDatabaseStore]);

  useEffect(() => {
    if (selectedPumpId === null) {
      setDetailPump(null);
      setCurveDraft([]);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void pumpDatabaseApi
      .getById(selectedPumpId)
      .then(({ data }) => {
        if (cancelled) return;
        setDetailPump(data);
        setCurveDraft(data.curvePoints ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setDetailPump(null);
          setCurveDraft([]);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPumpId]);

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
  };

  const handleAddClick = () => {
    setEditingPump(null);
    setFormOpen(true);
  };

  const handleEdit = (pump: PumpDto) => {
    setEditingPump(pump);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId === null) {
      return;
    }
    const id = pendingDeleteId;
    setDeletingId(id);
    try {
      await pumpDatabaseStore.deletePump(id);
      if (selectedPumpId === id) {
        setSelectedPumpId(null);
      }
      setPendingDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSavePump = async (draft: PumpDraft) => {
    const editingId = editingPump?.id ?? null;
    const body: PumpDto = {
      ...draft,
      id: editingId ?? draft.id,
      name: draft.name.trim(),
      manufacturer: draft.manufacturer.trim(),
      curvePoints: draft.curvePoints ?? [],
    };
    if (editingId != null) {
      await pumpDatabaseStore.updatePump({ ...body, id: editingId });
    } else {
      await pumpDatabaseStore.createPump({ ...body, id: 0 });
    }
    setFormOpen(false);
    setEditingPump(null);
    if (editingId != null && selectedPumpId === editingId) {
      void pumpDatabaseApi.getById(editingId).then(({ data }) => {
        setDetailPump(data);
        setCurveDraft(data.curvePoints ?? []);
      });
    }
  };

  /** PUT: весь насос + массив точек (пустой при очистке, без удалённой строки при удалении). */
  const persistCurvePoints = useCallback(
    async (nextPoints: CurvePointDto[]) => {
      if (!detailPump) return;
      setSavingCurve(true);
      try {
        const body: PumpDto = { ...detailPump, curvePoints: nextPoints };
        const merged = await pumpDatabaseStore.updatePump(body);
        setDetailPump(merged);
        setCurveDraft(merged.curvePoints ?? []);
      } finally {
        setSavingCurve(false);
      }
    },
    [detailPump, pumpDatabaseStore]
  );

  const handleSaveCurvePoints = useCallback(async () => {
    await persistCurvePoints(curveDraft);
  }, [curveDraft, persistCurvePoints]);

  const filteredPumps = useMemo(() => {
    if (sourceFilter === "all") return pumpDatabaseStore.pumps;
    if (sourceFilter === "user")
      return pumpDatabaseStore.pumps.filter((p) => p.userId !== 0);
    return pumpDatabaseStore.pumps.filter((p) => p.userId === 0);
  }, [pumpDatabaseStore.pumps, sourceFilter]);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
        overflow: "hidden",
        maxWidth: { xl: 1920 },
        mx: { xl: "auto" },
        width: 1,
      }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={{ xs: 2, xl: 2.5 }}
        sx={{ flex: 1, minHeight: 0, alignItems: "stretch" }}>
        <Box
          sx={{
            flex: { xs: 1, lg: 1.15, xl: 1.28 },
            minWidth: 0,
            minHeight: { xs: 320, lg: 0 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1, xl: 1.25 },
          }}>
          <Stack
            direction="row"
            spacing={{ xs: 1, xl: 1.5 }}
            alignItems="center"
            sx={{ flexWrap: "wrap", flexShrink: 0 }}>
            <Select
              size="small"
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as "all" | "user" | "db")
              }
              sx={{ minWidth: { xs: 210, xl: 240 } }}>
              <MenuItem value="all">Источник: Все</MenuItem>
              <MenuItem value="user">Источник: Пользовательские</MenuItem>
              <MenuItem value="db">Источник: База данных</MenuItem>
            </Select>
            <Button
              variant="contained"
              size="small"
              onClick={handleAddClick}
              sx={{ px: { xl: 2 }, py: { xl: 0.75 } }}>
              Добавить насос
            </Button>
          </Stack>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}>
            <PumpDatabaseTable
              data={filteredPumps}
              deletingId={deletingId}
              selectedPumpId={selectedPumpId}
              onSelectPump={setSelectedPumpId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Box>
        </Box>

        <Box
          sx={{
            flex: { xs: 1, lg: 1.75, xl: 1.92 },
            minWidth: 0,
            minHeight: { xs: 400, lg: 0 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1, md: 1.25 },
          }}>
          <Box
            sx={{ textAlign: "center", flexShrink: 0, px: { xs: 0.5, md: 1 } }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.95rem", xl: "1.1rem" },
                lineHeight: 1.35,
                mb: detailPump ? 2 : 0,
              }}>
              {detailPump
                ? `${detailPump.manufacturer} — ${detailPump.name}`
                : "Точки кривой и графики"}
            </Typography>
            {!detailPump && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}>
                Выберите насос в таблице слева
              </Typography>
            )}
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2, xl: 2 }}
            sx={{ flex: 1, minHeight: 0, alignItems: "stretch" }}>
            <Box
              sx={{
                flex: { xs: 1, md: "0 0 34%" },
                minWidth: { md: 220 },
                maxWidth: { md: 400 },
                minHeight: { xs: 280, md: 0 },
                display: "flex",
                flexDirection: "column",
              }}>
              <PumpCurvePointsTable
                hideHeader
                pump={detailPump}
                loading={detailLoading}
                curvePoints={curveDraft}
                onCurvePointsChange={setCurveDraft}
                onPersistCurvePoints={persistCurvePoints}
                onSaveCurvePoints={handleSaveCurvePoints}
                savingCurve={savingCurve}
              />
            </Box>
            <Box
              sx={{
                flex: { xs: 1, md: "1 1 0%" },
                minWidth: 0,
                minHeight: { xs: 360, md: 0 },
                display: "flex",
                flexDirection: "column",
              }}>
              <PumpCurveCharts
                hideHeader
                pump={detailPump}
                curvePoints={curveDraft}
              />
            </Box>
          </Stack>
        </Box>
      </Stack>

      <PumpFormDialog
        open={formOpen}
        title={
          editingPump
            ? "Редактирование насоса"
            : "Добавить пользовательский насос"
        }
        initialData={editingPump}
        loading={pumpDatabaseStore.loading}
        onClose={() => {
          setFormOpen(false);
          setEditingPump(null);
        }}
        onSubmit={handleSavePump}
      />
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Удалить насос?"
        description="Действие нельзя отменить. Насос будет удален из базы."
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        loading={deletingId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
});

export default PumpDatabasePage;
