import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Header() {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', mr: 2 }}
        >
          PumpCalc
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Button color="inherit" component={RouterLink} to="/login">
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
}

