import type { AuthData } from 'app/store/authStore/types/types';
import { axiosAuth } from 'entities/baseApi';

/** Ответ бэкенда после login / register */
export type AuthTokenResponse = {
  token: string;
  expires: string;
};

const json = { headers: { 'Content-Type': 'application/json' } };

/** `POST …/api/Auth/login` и `/api/Auth/register` */
export const authApi = {
  login: (data: AuthData) => {
    return axiosAuth.post<AuthTokenResponse>('/login', data, json);
  },
  registration: (data: AuthData) => {
    return axiosAuth.post<AuthTokenResponse>('/register', data, json);
  },
};
