import type { AxiosResponse } from 'axios';

export type PumpAssemblyPumpInput = {
  id: number;
  currentImpellerFrequency: number;
  headCorrection: number;
  efficiencyCorrection: number;
  typePump: number;
  wheelDiameter: number;
  impellerBladeWidth: number;
  inflowsCount: number;
  stepsCount: number;
};

export type PumpCorrectionType = 'single' | 'mainline';

export type PumpAssemblyRow = PumpAssemblyPumpInput & {
  /** Локальный id строки в таблице (не id насоса из БД). */
  rowId: number;
  checked: boolean;
  manufacturer: string;
  mark: string;
  passportImpellerFrequency: number;
  correctionType: PumpCorrectionType;
};

export type PumpAssemblyCalculateRequest = {
  connectionType: number;
  gv_mix: number;
  nu: number;
  rho: number;
  pumps: PumpAssemblyPumpInput[];
};

export type PumpAssemblyPlotPoint = {
  id: number;
  rate: number;
  head: number;
  efficiency: number;
};

export type PumpAssemblyCalculateResponse = {
  powerInput: number;
  pressureDrop: number;
  efficiency: number;
  head: number;
  plotPoint: PumpAssemblyPlotPoint[];
};

export type PumpAssemblyCalculateAxiosResponse = AxiosResponse<PumpAssemblyCalculateResponse>;
