import axios from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';
import { pumpUnitsApi } from 'entities/pumpUnits/api/PumpUnitsApi';
import {
  createEmptyPumpRow,
  DEFAULT_EFFICIENCY_CORRECTION,
  DEFAULT_HEAD_CORRECTION,
  initialAssemblyRowsFromMock,
  MOCK_ASSEMBLY_REQUEST,
} from 'entities/pumpUnits/model/pumpAssemblyDefaults';
import type { PumpDto } from 'entities/pumpDatabase/types/pumpTypes';
import type { UiStore } from 'app/store/uiStore/model/uiStore';
import type {
  PumpAssemblyCalculateRequest,
  PumpAssemblyCalculateResponse,
  PumpAssemblyRow,
} from 'entities/pumpUnits/types/pumpAssemblyTypes';

const LS_KEY = 'pumpCalc.pumpAssembly.v1';

type PersistedAssembly = {
  connectionType: number;
  gv_mix: number;
  nu: number;
  rho: number;
  pumps: PumpAssemblyRow[];
  nextRowId: number;
  selectedRowId: number | null;
};

function errMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return e.response?.data
      ? typeof e.response.data === 'string'
        ? e.response.data
        : JSON.stringify(e.response.data)
      : e.message;
  }
  return e instanceof Error ? e.message : String(e);
}

function isPumpAssemblyRow(x: unknown): x is PumpAssemblyRow {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.rowId === 'number' &&
    typeof o.checked === 'boolean' &&
    typeof o.id === 'number'
  );
}

/** Старые сохранения могли содержать `passportImpellerFrequency` вместо `impellerFrequency`. */
function normalizeAssemblyRowFromStorage(
  row: PumpAssemblyRow & { passportImpellerFrequency?: number }
): PumpAssemblyRow {
  const legacy = row.passportImpellerFrequency;
  const impellerFrequency =
    typeof row.impellerFrequency === 'number' && Number.isFinite(row.impellerFrequency)
      ? row.impellerFrequency
      : typeof legacy === 'number' && Number.isFinite(legacy)
        ? legacy
        : 0;
  const { passportImpellerFrequency: _drop, ...rest } = row;
  return {
    ...rest,
    impellerFrequency,
    configuration:
      typeof row.configuration === 'number' && Number.isFinite(row.configuration)
        ? row.configuration
        : 0,
  };
}

export class PumpUnitsStore {
  result: PumpAssemblyCalculateResponse | null = null;
  loading = false;
  error: string | null = null;

  /** Состояние страницы «насосная установка»: таблица + параметры жидкости (MobX + localStorage). */
  assemblyConnectionType = MOCK_ASSEMBLY_REQUEST.connectionType;
  assemblyGvMix = MOCK_ASSEMBLY_REQUEST.gv_mix;
  assemblyNu = MOCK_ASSEMBLY_REQUEST.nu;
  assemblyRho = MOCK_ASSEMBLY_REQUEST.rho;
  assemblyPumps: PumpAssemblyRow[] = initialAssemblyRowsFromMock();
  assemblyNextRowId = MOCK_ASSEMBLY_REQUEST.pumps.length + 1;
  assemblySelectedRowId: number | null = null;
  private readonly uiStore?: UiStore;

  constructor(uiStore?: UiStore) {
    this.uiStore = uiStore;
    makeAutoObservable(this);
    this.loadAssemblyFromStorage();
  }

  private persistAssembly() {
    if (typeof localStorage === 'undefined') return;
    try {
      const snap: PersistedAssembly = {
        connectionType: this.assemblyConnectionType,
        gv_mix: this.assemblyGvMix,
        nu: this.assemblyNu,
        rho: this.assemblyRho,
        pumps: this.assemblyPumps,
        nextRowId: this.assemblyNextRowId,
        selectedRowId: this.assemblySelectedRowId,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(snap));
    } catch {
      /* ignore quota / private mode */
    }
  }

  private loadAssemblyFromStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Partial<PersistedAssembly>;
      if (typeof p.connectionType !== 'number') return;
      if (typeof p.gv_mix !== 'number' || typeof p.nu !== 'number' || typeof p.rho !== 'number') return;
      if (!Array.isArray(p.pumps) || !p.pumps.every(isPumpAssemblyRow)) return;
      runInAction(() => {
        this.assemblyConnectionType = p.connectionType!;
        this.assemblyGvMix = p.gv_mix!;
        this.assemblyNu = p.nu!;
        this.assemblyRho = p.rho!;
        this.assemblyPumps = (p.pumps as (PumpAssemblyRow & { passportImpellerFrequency?: number })[]).map(
          normalizeAssemblyRowFromStorage
        );
        this.assemblyNextRowId =
          typeof p.nextRowId === 'number' && p.nextRowId > 0
            ? p.nextRowId
            : Math.max(0, ...this.assemblyPumps.map((r) => r.rowId)) + 1;
        this.assemblySelectedRowId =
          p.selectedRowId === null || typeof p.selectedRowId === 'number'
            ? p.selectedRowId
            : null;
      });
    } catch {
      /* ignore corrupt */
    }
  }

  setAssemblyConnectionType(value: number) {
    this.assemblyConnectionType = value;
    this.persistAssembly();
  }

  setAssemblyGvMix(value: number) {
    this.assemblyGvMix = value;
    this.persistAssembly();
  }

  setAssemblyNu(value: number) {
    this.assemblyNu = value;
    this.persistAssembly();
  }

  setAssemblyRho(value: number) {
    this.assemblyRho = value;
    this.persistAssembly();
  }

  setAssemblySelectedRowId(rowId: number | null) {
    this.assemblySelectedRowId = rowId;
    this.persistAssembly();
  }

  updateAssemblyRow(rowId: number, patch: Partial<PumpAssemblyRow>) {
    this.assemblyPumps = this.assemblyPumps.map((row) =>
      row.rowId === rowId ? { ...row, ...patch } : row
    );
    this.persistAssembly();
  }

  /** Подставить производителя/марку из БД по id насоса в строках. */
  enrichAssemblyRowsFromDatabase(dbPumps: PumpDto[]) {
    runInAction(() => {
      this.assemblyPumps = this.assemblyPumps.map((row) => {
        const p = dbPumps.find((x) => x.id === row.id);
        if (!p) return row;
        return {
          ...row,
          manufacturer: p.manufacturer,
          mark: p.name,
          impellerFrequency: p.impellerFrequency,
        };
      });
      this.persistAssembly();
    });
  }

  addAssemblyRow() {
    const rowId = this.assemblyNextRowId++;
    this.assemblyPumps = [...this.assemblyPumps, createEmptyPumpRow(rowId)];
    this.assemblySelectedRowId = rowId;
    this.persistAssembly();
  }

  deleteAssemblySelectedRow() {
    if (this.assemblySelectedRowId === null) return;
    const rid = this.assemblySelectedRowId;
    this.assemblyPumps = this.assemblyPumps.filter((r) => r.rowId !== rid);
    this.assemblySelectedRowId = null;
    this.persistAssembly();
  }

  /** Удалить все строки, отмеченные чекбоксом (и сразу синхронизировать localStorage). */
  deleteCheckedAssemblyRows() {
    if (!this.assemblyPumps.some((r) => r.checked)) return;
    const selectedStillExists =
      this.assemblySelectedRowId !== null &&
      this.assemblyPumps.some(
        (r) => r.rowId === this.assemblySelectedRowId && !r.checked
      );
    this.assemblyPumps = this.assemblyPumps.filter((r) => !r.checked);
    if (!selectedStillExists) {
      this.assemblySelectedRowId = null;
    }
    this.persistAssembly();
  }

  toggleAssemblyRowChecked(rowId: number, checked: boolean) {
    this.updateAssemblyRow(rowId, { checked });
  }

  setAllAssemblyRowsChecked(checked: boolean) {
    this.assemblyPumps = this.assemblyPumps.map((r) => ({ ...r, checked }));
    this.persistAssembly();
  }

  /** Добавляет выбранные конфигурации из вкладки "Подбор" в таблицу "Насосные установки". */
  applySelectionRowsToAssembly(rows: PumpAssemblyRow[]) {
    if (!rows.length) return 0;
    const startId = this.assemblyNextRowId;
    const nextRows = rows.map((row, i) => ({
      ...row,
      rowId: startId + i,
      checked: false,
    }));
    this.assemblyPumps = [...this.assemblyPumps, ...nextRows];
    this.assemblyNextRowId = startId + rows.length;
    this.persistAssembly();
    return rows.length;
  }

  /**
   * Заменяет таблицу установки результатом подбора: `stepsCount` в строке подбора = число насосов (`count`),
   * тип соединения — из `configuration` первой выбранной строки (как у бэка в подборе).
   */
  replaceAssemblyWithSelection(rows: PumpAssemblyRow[]) {
    if (!rows.length) return 0;
    const conf = rows[0].configuration;
    if (conf === 0 || conf === 1 || conf === 2) {
      this.assemblyConnectionType = conf;
    }

    let nextRowId = 1;
    const expanded: PumpAssemblyRow[] = [];

    for (const row of rows) {
      const qty = Math.max(1, Math.floor(Number(row.stepsCount) || 1));
      const passport =
        typeof row.impellerFrequency === 'number' && Number.isFinite(row.impellerFrequency) && row.impellerFrequency > 0
          ? row.impellerFrequency
          : typeof row.currentImpellerFrequency === 'number' &&
              Number.isFinite(row.currentImpellerFrequency) &&
              row.currentImpellerFrequency > 0
            ? row.currentImpellerFrequency
            : 50;
      const correction = row.correctionType === 'mainline' ? 'mainline' : 'single';
      const headCorrection =
        typeof row.headCorrection === 'number' && Number.isFinite(row.headCorrection) && row.headCorrection > 0
          ? row.headCorrection
          : DEFAULT_HEAD_CORRECTION;
      const efficiencyCorrection =
        typeof row.efficiencyCorrection === 'number' &&
        Number.isFinite(row.efficiencyCorrection) &&
        row.efficiencyCorrection > 0
          ? row.efficiencyCorrection
          : DEFAULT_EFFICIENCY_CORRECTION;
      const wheelDiameter =
        typeof row.wheelDiameter === 'number' && Number.isFinite(row.wheelDiameter) && row.wheelDiameter > 0
          ? row.wheelDiameter
          : 1;
      const impellerBladeWidth =
        typeof row.impellerBladeWidth === 'number' &&
        Number.isFinite(row.impellerBladeWidth) &&
        row.impellerBladeWidth > 0
          ? row.impellerBladeWidth
          : 0.01;

      for (let i = 0; i < qty; i++) {
        expanded.push({
          ...row,
          rowId: nextRowId++,
          checked: false,
          configuration: 0,
          stepsCount: 1,
          correctionType: correction,
          impellerFrequency: passport,
          currentImpellerFrequency: passport,
          headCorrection,
          efficiencyCorrection,
          typePump: typeof row.typePump === 'number' && Number.isFinite(row.typePump) ? row.typePump : 0,
          wheelDiameter,
          impellerBladeWidth,
          inflowsCount:
            typeof row.inflowsCount === 'number' && Number.isFinite(row.inflowsCount) ? row.inflowsCount : 0,
        });
      }
    }

    this.assemblyPumps = expanded;
    this.assemblyNextRowId = nextRowId;
    this.assemblySelectedRowId = null;
    this.persistAssembly();
    return expanded.length;
  }

  /** Сброс к моку и очистка localStorage (по желанию можно вызвать из UI позже). */
  resetAssemblyToDefaults() {
    runInAction(() => {
      this.assemblyConnectionType = MOCK_ASSEMBLY_REQUEST.connectionType;
      this.assemblyGvMix = MOCK_ASSEMBLY_REQUEST.gv_mix;
      this.assemblyNu = MOCK_ASSEMBLY_REQUEST.nu;
      this.assemblyRho = MOCK_ASSEMBLY_REQUEST.rho;
      this.assemblyPumps = initialAssemblyRowsFromMock();
      this.assemblyNextRowId = MOCK_ASSEMBLY_REQUEST.pumps.length + 1;
      this.assemblySelectedRowId = null;
      this.persistAssembly();
    });
  }

  async calculate(body: PumpAssemblyCalculateRequest) {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      const { data } = await pumpUnitsApi.calculate(body);
      runInAction(() => {
        this.result = data;
        this.loading = false;
      });
      return data;
    } catch (e) {
      runInAction(() => {
        this.error = errMessage(e);
        this.uiStore?.showError(this.error ?? 'Неизвестная ошибка');
        this.loading = false;
      });
      throw e;
    }
  }

  clearResult() {
    this.result = null;
  }

  clearError() {
    this.error = null;
  }
}
