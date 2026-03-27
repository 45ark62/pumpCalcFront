import axios from 'axios';

const baseURL = import.meta.env.VITE_MAIN_SERVICE_URL as string | undefined;

export const axiosV1 = axios.create({
  baseURL,
});

export function setToken(token: string | null) {
  if (!token) {
    delete axiosV1.defaults.headers.common.Authorization;
    return;
  }

  axiosV1.defaults.headers.common.Authorization = `Bearer ${token}`;
}

