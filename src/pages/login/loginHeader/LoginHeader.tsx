import { Box, Typography } from '@mui/material';

export default function LoginHeader({
  text,
  isError,
}: {
  text: string;
  isError?: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 1 }}>
      <Typography
        variant="h5"
        color={isError ? 'error' : 'primary'}
        sx={{ fontWeight: 700, textAlign: 'center' }}
      >
        {text}
      </Typography>
    </Box>
  );
}
