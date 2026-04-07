import { Alert, Box, createTheme, CssBaseline, Snackbar, ThemeProvider } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useUiStore } from 'app/store/uiStore/model/useUiStore';
import { useStore } from 'app/store/useStore';
import Header from 'widgets/header/Header';

const RootLayout = observer(function RootLayout() {
  const location = useLocation();
  const { uiStore } = useStore();
  const [theme] = useState(() => {
    return createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#1a365d',
          dark: '#132a47',
          light: '#2b6cb0',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f5f6f8',
          paper: '#ffffff',
        },
      },
      components: {
        MuiSkeleton: {
          styleOverrides: { root: { transform: 'none', display: 'flex' } },
        },
      },
    });
  });
  useUiStore();

  const isLoginRoute = location.pathname === '/login' || location.pathname.startsWith('/login/');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          bgcolor: 'background.default',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!isLoginRoute && <Header />}
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Box>
        <Snackbar
          open={uiStore.notification.open}
          autoHideDuration={5000}
          onClose={() => uiStore.closeNotification()}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: 1 }}
        >
          {(() => {
            const isError = uiStore.notification.severity === 'error';
            const bg = isError ? '#ef9a9a' : '#f6d365';
            const text = isError ? '#ffffff' : '#2a2200';
            return (
          <Alert
            onClose={() => uiStore.closeNotification()}
            severity={uiStore.notification.severity}
            variant="filled"
            sx={{
              width: '100%',
              minWidth: 280,
              borderRadius: '12px',
              bgcolor: bg,
              color: text,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
              '& .MuiAlert-icon': {
                color: text,
                alignItems: 'center',
              },
              '& .MuiAlert-message': {
                fontWeight: 500,
                fontSize: '12px',
                lineHeight: 1.3,
              },
              '& .MuiAlert-action .MuiIconButton-root': {
                color: text,
              },
            }}
          >
            {uiStore.notification.message}
          </Alert>
            );
          })()}
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
});

export default RootLayout;
