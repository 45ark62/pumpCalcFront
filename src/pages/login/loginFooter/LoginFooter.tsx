import { Box, Typography, useTheme } from '@mui/material';
import type { LoginPageFormType } from '../LoginPage';


export default function LoginFooter({
  activeForm,
  handleSwitchForm,
}: {
  activeForm: LoginPageFormType;
  handleSwitchForm: () => void;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        width: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: -2,
      }}
    >
      <Typography variant="body2" sx={{mt:'20px'}}>
        {activeForm === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
      </Typography>
      <Box
        onClick={handleSwitchForm}
        role="button"
        sx={{
          'display': 'flex',
          'justifyContent': 'center',
          'alignItems': 'center',
          'cursor': 'pointer',
          'color': theme.palette.primary.main,

          '&:hover': {
            color: theme.palette.primary.dark,
          },
        }}
      >
        <Typography variant="body2" sx={{mt:'20px'}}>   
          {activeForm === 'login' ? 'Регистрация' : 'Войти'}
        </Typography>
      </Box>
    </Box>
  );
}
