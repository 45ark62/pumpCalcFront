import { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { NavLink, useNavigate } from 'react-router-dom';
import { paths } from 'app/paths';
import { useStore } from 'app/store/useStore';

const BAR_BG = 'linear-gradient(90deg, #1a365d 0%, #2b6cb0 100%)';
const TEXT = 'rgba(255, 255, 255, 0.92)';
const TEXT_MUTED = 'rgba(255, 255, 255, 0.72)';

const navItems: { to: string; label: string }[] = [
  { to: paths.root, label: 'База насосов' },
  { to: paths.pumpUnits, label: 'Насосные установки' },
  { to: paths.pumpUnitSelection, label: 'Подбор' },
];

export default observer(function Header() {
  const { authStore } = useStore();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const handleLogout = () => {
    setMenuAnchor(null);
    authStore.logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: BAR_BG,
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        color: TEXT,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: { xs: 52, sm: 56 },
          px: { xs: 2, sm: 3 },
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <Box
          component="nav"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1 },
            flexWrap: 'wrap',
          }}
        >
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={{ textDecoration: 'none' }}
              end={to === paths.root}
            >
              {({ isActive }) => (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    display: 'inline-block',
                    px: { xs: 1.25, sm: 1.75 },
                    py: 1,
                    borderRadius: 1,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? TEXT : TEXT_MUTED,
                    letterSpacing: 0.2,
                    transition: 'color 0.15s ease, background-color 0.15s ease',
                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    '&:hover': {
                      color: TEXT,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {label}
                </Typography>
              )}
            </NavLink>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {authStore.isAuth ? (
            <>
              <Button
                id="header-user-menu"
                variant="text"
                color="inherit"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                endIcon={
                  <ChevronDown
                    size={20}
                    strokeWidth={2}
                    style={{
                      opacity: 0.85,
                      transition: 'transform 0.2s',
                      transform: menuOpen ? 'rotate(180deg)' : 'none',
                    }}
                  />
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  color: TEXT,
                  px: 1,
                  py: 0.5,
                  minWidth: 0,
                  maxWidth: { xs: 220, sm: 340 },
                  borderRadius: 0,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ fontWeight: 500, color: 'inherit' }}
                  title={authStore.userDisplayLabel}
                >
                  {authStore.userDisplayLabel}
                </Typography>
              </Button>
              <Menu
                anchorEl={menuAnchor}
                open={menuOpen}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: { mt: 1, minWidth: 200, borderRadius: 2 },
                  },
                }}
              >
                <MenuItem
                  disabled
                  sx={{
                    opacity: 1,
                    py: 1.5,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Аккаунт
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>
                    {authStore.userDisplayLabel}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Выйти</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={NavLink}
              to="/login"
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'rgba(255, 255, 255, 0.45)',
                color: TEXT,
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.75)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              Войти
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
});
