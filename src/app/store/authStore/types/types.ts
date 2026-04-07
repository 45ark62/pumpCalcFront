export type AuthData = { userName: string; password: string };

export type SignInError = 'auth';
export type RestoreError = 'wrongPassword';

export type Errors = {
  signin: SignInError | null;
  restore: RestoreError | null;
  registration: SignInError | null;
};
