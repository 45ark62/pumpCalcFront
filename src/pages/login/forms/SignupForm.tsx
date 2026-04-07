import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Alert, Box, Button, TextField } from '@mui/material';
import { useStore } from 'app/store/useStore';

export const NAME_MAX_LENGTH = 50;
export const SURNAME_MAX_LENGTH = 50;

export type SignupFormValues = {
  login: string;
  password: string;
  passwordConfirm: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default observer(function SignupForm({
  onSubmit,
}: {
  onSubmit: (data: SignupFormValues) => void | Promise<void>;
}) {
  const { authStore } = useStore();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [touched, setTouched] = useState({
    login: false,
    password: false,
    passwordConfirm: false,
  });

  const loginTrimmed = login.trim();
  const emailError =
    loginTrimmed.length === 0
      ? 'Введите email'
      : !EMAIL_RE.test(loginTrimmed)
        ? 'Введите корректный email'
        : '';

  const passwordError =
    password.length === 0
      ? 'Введите пароль'
      : password.length < MIN_PASSWORD_LENGTH
        ? `Минимум ${MIN_PASSWORD_LENGTH} символов`
        : !/[A-Za-z]/.test(password) || !/\d/.test(password)
          ? 'Пароль должен содержать буквы и цифры'
          : '';

  const passwordConfirmError =
    passwordConfirm.length === 0
      ? 'Повторите пароль'
      : password !== passwordConfirm
        ? 'Пароли не совпадают'
        : '';

  const hasValidationErrors = Boolean(emailError || passwordError || passwordConfirmError);

  const showEmailError = touched.login && Boolean(emailError);
  const showPasswordError = touched.password && Boolean(passwordError);
  const showPasswordConfirmError = touched.passwordConfirm && Boolean(passwordConfirmError);

  return (
    <Box
      component="form"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      onSubmit={(e) => {
        e.preventDefault();
        setTouched({ login: true, password: true, passwordConfirm: true });
        if (hasValidationErrors) return;
        void onSubmit({ login: loginTrimmed, password, passwordConfirm });
      }}
    >
      {authStore.errors.registration ? (
        <Alert severity="error">Не удалось зарегистрироваться. Проверьте данные.</Alert>
      ) : null}
      <TextField
        label="Email"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        onBlur={() => setTouched((prev) => ({ ...prev, login: true }))}
        fullWidth
        error={showEmailError}
        helperText={showEmailError ? emailError : ' '}
      />
      <TextField
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
        fullWidth
        autoComplete="new-password"
        error={showPasswordError}
        helperText={showPasswordError ? passwordError : ' '}
      />
      <TextField
        label="Повтор пароля"
        type="password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        onBlur={() => setTouched((prev) => ({ ...prev, passwordConfirm: true }))}
        fullWidth
        autoComplete="new-password"
        error={showPasswordConfirmError}
        helperText={showPasswordConfirmError ? passwordConfirmError : ' '}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={authStore.isSomePending || hasValidationErrors}
      >
        Зарегистрироваться
      </Button>
    </Box>
  );
});
