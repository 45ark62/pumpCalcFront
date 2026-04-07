import { Box, Skeleton, Stack } from '@mui/material';

const PumpDatabasePageSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Skeleton variant="text" width={200} height={36} sx={{ mb: 2 }} />
      <Stack spacing={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={72} />
        <Skeleton variant="rectangular" height={40} />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={36} />
        ))}
      </Stack>
    </Box>
  );
};

export default PumpDatabasePageSkeleton;
