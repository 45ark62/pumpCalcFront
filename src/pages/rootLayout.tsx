import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useUiStore } from 'app/store/uiStore/model/useUiStore';
import Header from 'widgets/header/Header';

const RootLayout = observer(function RootLayout() {
  const [theme] = useState(() => {
    return createTheme({
      palette: {
        mode: 'light',
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
        <Header />
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
});

export default RootLayout;
