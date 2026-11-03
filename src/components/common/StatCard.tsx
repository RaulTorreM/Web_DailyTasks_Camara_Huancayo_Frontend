import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, Card, CardActionArea, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors, shadow } from '../../theme/tokens';

export type StatTone = 'primary' | 'warning' | 'error' | 'success';

interface Props {
  label: string;
  value: number | string;
  icon: SvgIconComponent;
  tone?: StatTone;
  to: string;
  hint?: string;
  /** Pinta el número con el color del tono (para alertas reales). */
  highlight?: boolean;
}

/** Tarjeta de indicador clicable. */
export default function StatCard({ label, value, icon: Icon, tone = 'primary', to, hint, highlight }: Props) {
  const nav = useNavigate();
  const theme = useTheme();
  const TONES: Record<StatTone, { soft: string; main: string }> = {
    primary: { soft: alpha(theme.palette.primary.main, 0.12), main: theme.palette.primary.main },
    warning: { soft: colors.warningSoft, main: colors.warning },
    error: { soft: colors.errorSoft, main: colors.error },
    success: { soft: colors.successSoft, main: colors.success },
  };
  const palette = TONES[tone];

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: shadow.raised,
          borderColor: alpha(palette.main, 0.3),
        },
      }}
    >
      <CardActionArea onClick={() => nav(to)} sx={{ p: { xs: 1.75, sm: 2.25 }, height: '100%', display: 'block' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: palette.soft,
              color: palette.main,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <ChevronRightRoundedIcon sx={{ fontSize: 20, color: colors.textMuted, mt: 0.5 }} />
        </Stack>

        <Typography
          sx={{
            mt: 1.75,
            fontSize: { xs: '1.7rem', sm: '1.9rem' },
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.045em',
            color: highlight ? palette.main : colors.text,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ mt: 0.65, fontSize: '.82rem', fontWeight: 700, color: colors.text, lineHeight: 1.3 }}>
          {label}
        </Typography>
        {hint && (
          <Typography sx={{ mt: 0.25, fontSize: '.73rem', color: colors.textSecondary, lineHeight: 1.35 }}>
            {hint}
          </Typography>
        )}
      </CardActionArea>
    </Card>
  );
}
