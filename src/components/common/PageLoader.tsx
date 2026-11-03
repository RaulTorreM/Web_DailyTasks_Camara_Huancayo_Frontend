import { Box, CircularProgress, Typography } from '@mui/material';

/** Indicador de carga usado mientras se descarga el código de una pantalla. */
export default function PageLoader() {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ display: 'grid', placeItems: 'center', gap: 1.5, minHeight: '46vh', py: 6 }}
    >
      <CircularProgress size={30} thickness={4} />
      <Typography variant="body2" color="text.secondary">Cargando…</Typography>
    </Box>
  );
}
