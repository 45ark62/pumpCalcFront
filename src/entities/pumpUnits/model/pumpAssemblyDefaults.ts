import type {
  PumpAssemblyCalculateRequest,
  PumpAssemblyPumpInput,
  PumpAssemblyRow,
} from 'entities/pumpUnits/types/pumpAssemblyTypes';

export const DEFAULT_HEAD_CORRECTION = 1;
export const DEFAULT_EFFICIENCY_CORRECTION = 1;

export const MOCK_ASSEMBLY_REQUEST: PumpAssemblyCalculateRequest = {
  connectionType: 2,
  gv_mix: 1041.67,
  nu: 1.09252114581423e-6,
  rho: 1000.43977343534,
  pumps: [
    {
      id: 12,
      currentImpellerFrequency: 50,
      headCorrection: 0.9,
      efficiencyCorrection: 1,
      typePump: 0,
      wheelDiameter: 1,
      impellerBladeWidth: 0.01,
      inflowsCount: 0,
      stepsCount: 0,
    },
    {
      id: 12,
      currentImpellerFrequency: 50,
      headCorrection: 0.9,
      efficiencyCorrection: 1,
      typePump: 0,
      wheelDiameter: 1,
      impellerBladeWidth: 0.01,
      inflowsCount: 0,
      stepsCount: 0,
    },
    {
      id: 27,
      currentImpellerFrequency: 50,
      headCorrection: 1,
      efficiencyCorrection: 1,
      typePump: 0,
      wheelDiameter: 1,
      impellerBladeWidth: 0.01,
      inflowsCount: 0,
      stepsCount: 0,
    },
    {
      id: 27,
      currentImpellerFrequency: 50,
      headCorrection: 1,
      efficiencyCorrection: 1,
      typePump: 0,
      wheelDiameter: 1,
      impellerBladeWidth: 0.01,
      inflowsCount: 0,
      stepsCount: 0,
    },
  ],
};

export function createEmptyPumpRow(rowId: number): PumpAssemblyRow {
  return {
    rowId,
    checked: false,
    manufacturer: '',
    mark: '',
    correctionType: 'single',
    passportImpellerFrequency: 0,
    id: 0,
    currentImpellerFrequency: 0,
    headCorrection: DEFAULT_HEAD_CORRECTION,
    efficiencyCorrection: DEFAULT_EFFICIENCY_CORRECTION,
    typePump: 0,
    wheelDiameter: 0,
    impellerBladeWidth: 0,
    inflowsCount: 0,
    stepsCount: 0,
  };
}

export function rowFromPumpInput(input: PumpAssemblyPumpInput, rowId: number): PumpAssemblyRow {
  return {
    rowId,
    checked: false,
    manufacturer: '',
    mark: '',
    correctionType: 'single',
    passportImpellerFrequency: 0,
    ...input,
  };
}

export function initialAssemblyRowsFromMock(): PumpAssemblyRow[] {
  return MOCK_ASSEMBLY_REQUEST.pumps.map((pump, i) => rowFromPumpInput(pump, i + 1));
}
