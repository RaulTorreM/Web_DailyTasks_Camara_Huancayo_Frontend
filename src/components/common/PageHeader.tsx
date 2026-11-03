import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  /** Texto de apoyo bajo el título. */
  subtitle?: ReactNode;
  /** Ruta a la que vuelve la flecha; sin valor, vuelve a la pantalla anterior. */
  backTo?: string;
  actions?: ReactNode;
}

/** Cabecera de páginas internas (ficha, formulario, documentos). */
export default function PageHeader({ title, subtitle, backTo, actions }: Props) {
  const nav = useNavigate();

  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      spacing={1.25}
      sx={{ mb: { xs: 2, md: 2.5 }, flexWrap: 'wrap', rowGap: 1 }}
    >
      <IconButton
        aria-label="Volver"
        onClick={() => (backTo ? nav(backTo) : nav(-1))}
        sx={{
          width: 42,
          height: 42,
          flexShrink: 0,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'background.paper', borderColor: 'text.disabled' },
        }}
      >
        <ArrowBackRoundedIcon fontSize="small" />
      </IconButton>

      <Box sx={{ flex: '1 1 170px', minWidth: 0, pt: 0.15 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{ fontSize: { xs: '1.22rem', md: '1.4rem' }, lineHeight: 1.2, letterSpacing: '-0.025em' }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {actions && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexWrap: 'wrap', rowGap: 1, justifyContent: 'flex-end', flexShrink: 0, pt: 0.25 }}
        >
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
