import { axiosV1 } from 'entities/baseApi';
import type {
  PumpAssemblyCalculateRequest,
  PumpAssemblyCalculateResponse,
} from 'entities/pumpUnits/types/pumpAssemblyTypes';

const json = { headers: { 'Content-Type': 'application/json' } };

/** `POST …/api/PumpAssembly/calculate` */
export const pumpUnitsApi = {
  calculate: (body: PumpAssemblyCalculateRequest) =>
    axiosV1.post<PumpAssemblyCalculateResponse>('/PumpAssembly/calculate', body, json),
};
