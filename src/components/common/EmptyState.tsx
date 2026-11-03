import { Box, Typography, useTheme } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { alpha } from '@mui/material/styles';
import { colors } from '../../theme/tokens';

interface Props {
  icon: SvgIconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

/** Estado vacío amable: explica qué pasa y qué hacer. */
export default function EmptyState({ icon: Icon, title, description, action, compact }: Props) {
  const theme = useTheme();

  return (
    <Box sx={{ textAlign: 'center', py: compact ? 3 : 5, px: 2 }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          mx: 'auto',
          mb: 1.75,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          color: theme.palette.primary.main,
        }}
      >
        <Icon sx={{ fontSize: 25 }} />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '.95rem', color: colors.text }}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 380, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
