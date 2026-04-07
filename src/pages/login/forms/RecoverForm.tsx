import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';

export type RecoverFormValues = {
  password: string;
  passwordConfirm: string;
};

export default observer(function RecoverForm({
  onSubmit,
}: {
  onSubmit: (data: RecoverFormValues) => void | Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  return (
    <Box
      component="form"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit({ password, passwordConfirm });
      }}
    >
      <TextField
        label="Новый пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        autoComplete="new-password"
      />
      <TextField
        label="Повтор пароля"
        type="password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        fullWidth
        autoComplete="new-password"
      />
      <Button type="submit" variant="contained">
        Сохранить пароль
      </Button>
    </Box>
  );
});
