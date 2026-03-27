
import { Box, useTheme } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Outlet } from 'react-router-dom';

const ENTER_DURATION_MS = 400;

const AuthorizedLayout = observer(function AuthorizedLayout() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: 0,
        animation: `authorizedLayoutFadeIn ${ENTER_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
        '@keyframes authorizedLayoutFadeIn': {
          to: { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          display: 'flex',
          flexGrow: 1,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: '24px',
            pl: '12px',
            height: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              flexGrow: 1,
              p: '12px',
              borderRadius: '32px',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default AuthorizedLayout;
