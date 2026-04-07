import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material';
import { Paper } from '@mui/material';

export type LoginPageFormType = 'login' | 'register' | 'restore';

type LoginContainerProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export default function LoginContainer({ children, sx }: LoginContainerProps) {
  return (
    <Paper
      square
      elevation={0}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(90deg, #1a365d 0%, #2b6cb0 100%)',
        overflow: 'hidden',
        px: { xs: 2, sm: 4 },
        ...sx,
      }}
    >
      <Paper
        elevation={5}
        sx={{
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: 2,
          width: '100%',
          maxWidth: 440,
          borderRadius: 3,
        }}
      >
        {children}
      </Paper>
    </Paper>
  );
}
