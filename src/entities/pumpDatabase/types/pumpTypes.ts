/** Точка кривой насоса */
export type CurvePointDto = {
  id: number;
  rate: number;
  head: number;
  efficiency: number;
};

/** Элемент списка / ответ GET по id / тело POST (как в Swagger) */
export type PumpDto = {
  id: number;
  name: string;
  manufacturer: string;
  minRate: number;
  maxRate: number;
  impellerFrequency: number;
  head: number;
  supply: number;
  userId: number;
  curvePoints: CurvePointDto[];
};
