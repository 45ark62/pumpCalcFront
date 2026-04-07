import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, TextField } from '@mui/material';
import { paths } from 'app/paths';
import { useStore } from 'app/store/useStore';

export default observer(function LoginForm() {
  const { authStore } = useStore();
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    try {
      await authStore.login({ data: { userName: login, password } });
      if (authStore.isAuth) {
        navigate(paths.main, { replace: true });
      }
    } catch {
      // ошибка уже в authStore.errors
    } finally {
      setPending(false);
    }
  };

  return (
    <Box
      component="form"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {authStore.errors.signin ? (
        <Alert severity="error">Неверный логин или пароль</Alert>
      ) : null}
      <TextField
        label="Логин"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        fullWidth
        autoComplete="username"
      />
      <TextField
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        autoComplete="current-password"
      />
      <Button type="submit" variant="contained" disabled={pending}>
        Войти
      </Button>
    </Box>
  );
});
