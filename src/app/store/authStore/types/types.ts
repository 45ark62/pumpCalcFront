export type AuthData = { login: string; password: string };

export type SignInError = 'auth';
export type RestoreError = 'wrongPassword';

export type Errors = {
  signin: SignInError | null;
  restore: RestoreError | null;
};
