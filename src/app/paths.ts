const root = '/pumpDatabase' as const;

/** Маршруты приложения */
export const paths = {
  root,
  /** Главный экран после входа / регистрации */
  main: root,
  pumpUnits: '/pumpUnits',
  pumpUnitSelection: '/pumpUnitSelection',
} as const;
  