import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { Box, Typography, useTheme } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { brand, layout, shadow } from '../../theme/tokens';
import { isActive, MOBILE_TABS, type NavItem } from './navItems';

interface Props {
  onOpenMore: () => void;
}

function Tab({ item }: { item: NavItem }) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const active = isActive(pathname, item);
  const Icon = item.icon;

  return (
    <Box
      component={RouterLink}
      to={item.to}
      aria-current={active ? 'page' : undefined}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.35,
        minHeight: 48,
        color: active ? theme.palette.primary.main : theme.palette.text.secondary,
        textDecoration: 'none',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform .12s ease',
        '&:active': { transform: 'scale(0.95)' },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          width: active ? 22 : 0,
          height: 3,
          borderRadius: 2,
          bgcolor: brand.gold,
          transition: 'width .2s ease',
        },
      }}
    >
      <Icon sx={{ fontSize: 24 }} />
      <Typography
        component="span"
        sx={{ fontSize: '.66rem', fontWeight: active ? 800 : 600, lineHeight: 1.1, letterSpacing: '.01em' }}
      >
        {item.label}
      </Typography>
    </Box>
  );
}

/** Barra inferior móvil: destinos principales + acción central para crear. */
export default function MobileNav({ onOpenMore }: Props) {
  const theme = useTheme();

  return (
    <Box
      component="nav"
      aria-label="Navegación móvil"
      className="no-print"
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(22,26,42,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: shadow.nav,
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', height: layout.bottomNav, px: 0.5 }}>
        <Tab item={MOBILE_TABS[0]} />
        <Tab item={MOBILE_TABS[1]} />

        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <Box
            component={RouterLink}
            to="/tablero?nuevo=1"
            aria-label="Nuevo pendiente"
            sx={{
              position: 'absolute',
              top: -22,
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              border: `4px solid ${theme.palette.background.paper}`,
              boxShadow: '0 12px 26px -10px rgba(29,31,110,0.7)',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
              transition: 'transform .12s ease',
              '&:active': { transform: 'scale(0.94)' },
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 29 }} />
          </Box>
          <Typography
            sx={{
              position: 'absolute',
              bottom: 8,
              fontSize: '.6rem',
              fontWeight: 800,
              color: theme.palette.primary.main,
              letterSpacing: '.01em',
            }}
          >
            Nuevo
          </Typography>
        </Box>

        <Tab item={MOBILE_TABS[2]} />

        <Box
          component="button"
          type="button"
          onClick={onOpenMore}
          aria-label="Más opciones"
          sx={{
            all: 'unset',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.35,
            minHeight: 48,
            cursor: 'pointer',
            color: theme.palette.text.secondary,
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform .12s ease',
            '&:active': { transform: 'scale(0.95)' },
          }}
        >
          <MoreHorizRoundedIcon sx={{ fontSize: 24 }} />
          <Typography component="span" sx={{ fontSize: '.66rem', fontWeight: 600, lineHeight: 1.1 }}>
            Más
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
