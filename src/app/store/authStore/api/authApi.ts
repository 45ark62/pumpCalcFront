import type { AuthData } from 'app/store/authStore/types/types';



const DEV_TOKEN = 'c63664bd-3b14-44c4-a1de-4a3fa1264781';
type AuthResponse = { access_token: string };
type AuthResponseMOCK = { data: AuthResponse };

export const authApi = {
  login: (_data: AuthData) => {
    /*return axiosV1.post<AuthResponse>('/login', data, {
      headers: { 'Content-Type': 'application/json' },
    });*/
    return new Promise<AuthResponseMOCK>((resolve) => {
      setTimeout(() => {
        resolve({ data: { access_token: DEV_TOKEN } });
      }, 500);
    });
  },

 
};
