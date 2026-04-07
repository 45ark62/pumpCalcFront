import { axiosV1 } from 'entities/baseApi';
import type { PumpDto } from 'entities/pumpDatabase/types/pumpTypes';

const json = { headers: { 'Content-Type': 'application/json' } };

/** `GET/POST/DELETE …/api/Pumps`, `GET …/api/Pumps/{id}` */
export const pumpDatabaseApi = {
  getList: () => axiosV1.get<PumpDto[]>('/Pumps'),

  getById: (id: number) => axiosV1.get<PumpDto>(`/Pumps/${id}`),

  create: (body: PumpDto) => axiosV1.post<PumpDto>('/Pumps', body, json),
  
  update: (body: PumpDto) => axiosV1.put<PumpDto>(`/Pumps`, body, json),

  remove: (id: number) => axiosV1.delete<void>(`/Pumps/${id}`),
};
