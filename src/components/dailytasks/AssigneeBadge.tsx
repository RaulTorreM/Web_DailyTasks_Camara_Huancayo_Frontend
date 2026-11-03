import { Avatar, Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { brand, colors, ownTask } from '../../theme/tokens';
import { initials } from '../../utils/user';

interface Props {
  name: string;
  areaName?: string;
  isCurrentUser?: boolean;
  size?: 'small' | 'medium';
  showArea?: boolean;
}

/** Responsable con avatar y nombre; el usuario actual se destaca en dorado. */
export default function AssigneeBadge({
  name,
  areaName,
  isCurrentUser = false,
  size = 'small',
  showArea = false,
}: Props) {
  const theme = useTheme();
  const avatarSize = size === 'small' ? 26 : 34;

  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
      <Avatar
        sx={{
          width: avatarSize,
          height: avatarSize,
          fontSize: size === 'small' ? '.62rem' : '.72rem',
          fontWeight: 800,
          bgcolor: isCurrentUser ? alpha(brand.gold, 0.18) : alpha(theme.palette.primary.main, 0.14),
          color: isCurrentUser ? ownTask.text : theme.palette.primary.main,
          border: isCurrentUser ? `1px solid ${alpha(brand.gold, 0.55)}` : '1px solid transparent',
        }}
      >
        {initials(name)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography
            noWrap
            sx={{
              fontSize: size === 'small' ? '.78rem' : '.86rem',
              fontWeight: isCurrentUser ? 800 : 700,
              color: isCurrentUser ? ownTask.text : colors.text,
              lineHeight: 1.25,
            }}
          >
            {name || 'Sin responsable'}
          </Typography>
          {isCurrentUser && (
            <Chip
              label="Tú"
              size="small"
              sx={{
                height: 18,
                fontSize: '.6rem',
                fontWeight: 800,
                bgcolor: alpha(brand.gold, 0.16),
                color: ownTask.text,
                '& .MuiChip-label': { px: 0.6 },
              }}
            />
          )}
        </Stack>
        {showArea && areaName && (
          <Typography noWrap sx={{ fontSize: '.66rem', color: colors.textMuted, lineHeight: 1.3 }}>
            {areaName}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
