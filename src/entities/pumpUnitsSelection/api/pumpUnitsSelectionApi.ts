import { axiosV1 } from 'entities/baseApi';

export type PumpAssemblyAdjustRequest = {
  rate: number;
  workingAreaDelta: number;
  useHead: boolean;
  head: number;
  headDelta: number;
  deltaPressure: number;
  maxPressureDelta: number;
  enviromentDensity: number;
  setHeadCorrection: boolean;
  setPassportImpellerFrequency: boolean;
  passportImpellerFrequency: number;
  headCorrection: number;
  parallelPumpsMaxCount: number;
  serialPumpsMaxCount: number;
  setParallelPumpsMaxCount: boolean;
  setSerialPumpsMaxCount: boolean;
};

// Фактический контракт ответа можно уточнить позже.
export type PumpAssemblyAdjustResponse = unknown;

const json = { headers: { 'Content-Type': 'application/json' } };

/** `POST …/api/PumpAssembly/adjust` */
export const pumpUnitsSelectionApi = {
  calculate: (body: PumpAssemblyAdjustRequest) =>
    axiosV1.post<PumpAssemblyAdjustResponse>('/PumpAssembly/adjust', body, json),
};
