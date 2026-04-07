import axios from 'axios';

/**
 * База для API. Не должен совпадать с портом Vite, если бэкенд на другом порту.
 * Пустая строка в .env → запросы идут на тот же origin (Vite) и проксируются на бэкенд (см. vite.config).
 */
const baseURL = (import.meta.env.VITE_MAIN_SERVICE_URL as string | undefined)?.replace(
  /\/$/,
  ''
);

export const axiosV1 = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : '/api',
});

/** `POST …/api/Auth/login`, `POST …/api/Auth/register` */
export const axiosAuth = axios.create({
  baseURL: baseURL ? `${baseURL}/api/Auth` : '/api/Auth',
});

export function setToken(token: string | null) {
  if (!token) {
    delete axiosV1.defaults.headers.common.Authorization;
    delete axiosAuth.defaults.headers.common.Authorization;
    return;
  }

  const value = `Bearer ${token}`;
  axiosV1.defaults.headers.common.Authorization = value;
  axiosAuth.defaults.headers.common.Authorization = value;
}

