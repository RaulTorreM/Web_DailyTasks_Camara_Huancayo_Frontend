import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { brand, colors } from '../../theme/tokens';

/** Marca completa para el sidebar oscuro (wordmark blanco del logo oficial). */
export function SidebarBrand() {
  return (
    <Box
      component={RouterLink}
      to="/"
      aria-label="Ir al inicio"
      sx={{
        display: 'block',
        px: 2.5,
        pt: 3,
        pb: 2.25,
        textDecoration: 'none',
        borderBottom: `1px solid ${alpha('#FFFFFF', 0.07)}`,
      }}
    >
      <Box
        component="img"
        src="/brand/logo-cch.png"
        alt="Cámara de Comercio de Huancayo"
        width={800}
        height={385}
        sx={{ display: 'block', width: '100%', maxWidth: 212, height: 'auto' }}
      />
      <Stack direction="row" alignItems="center" spacing={1.15} sx={{ mt: 1.75 }}>
        <Box sx={{ width: 22, height: '1px', bgcolor: alpha(brand.goldLight, 0.8) }} />
        <Typography
          sx={{
            color: alpha('#FFFFFF', 0.55),
            fontSize: '.66rem',
            fontWeight: 600,
            letterSpacing: '.04em',
          }}
        >
          Control de Tareas
        </Typography>
      </Stack>
    </Box>
  );
}

/** Marca compacta para fondos claros (barra superior móvil, drawer, login). */
export function BrandMark({ subtitle = 'Cámara de Comercio' }: { subtitle?: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
      <Box
        component="img"
        src="/brand/logo-cch-mark.png"
        alt=""
        width={256}
        height={256}
        sx={{ width: 38, height: 38, flexShrink: 0 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{ fontWeight: 800, fontSize: '.92rem', color: colors.text, lineHeight: 1.15, letterSpacing: '-0.01em' }}
          noWrap
        >
          DailyTasks
        </Typography>
        <Typography
          sx={{
            fontSize: '.6rem',
            letterSpacing: '.13em',
            textTransform: 'uppercase',
            color: colors.textSecondary,
            fontWeight: 700,
            lineHeight: 1.3,
          }}
          noWrap
        >
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}
