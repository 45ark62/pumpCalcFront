
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
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          display: 'flex',
          flexGrow: 1,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 2.5, xl: 3 },
            pl: { xs: 1.5, sm: 2, xl: 2.5 },
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              flexGrow: 1,
              height: '100%',
              minHeight: 0,
              p: { xs: 1.5, xl: 2 },
              borderRadius: { xs: '24px', xl: '28px' },
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default AuthorizedLayout;
