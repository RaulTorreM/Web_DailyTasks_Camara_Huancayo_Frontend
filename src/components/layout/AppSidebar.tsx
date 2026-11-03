import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Avatar, Box, Button, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { brand, colors, layout } from '../../theme/tokens';
import { initials, roleLabel } from '../../utils/user';
import { SidebarBrand } from './Brand';
import { isActive, navGroupsFor } from './navItems';

/**
 * Sidebar de escritorio. Superficie azul institucional, reglas finas y un
 * único acento dorado para la acción principal y la sección activa.
 */
export default function AppSidebar() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { session, logout } = useAuth();
  const groups = navGroupsFor(session?.role);

  return (
    <Box
      component="nav"
      aria-label="Navegación principal"
      className="no-print"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        position: 'fixed',
        inset: '0 auto 0 0',
        width: layout.sidebar,
        zIndex: (t) => t.zIndex.drawer,
        color: colors.onDark,
        bgcolor: brand.navy,
        backgroundImage: 'linear-gradient(180deg, #181A4B 0%, #111233 48%, #0C0D29 100%)',
        borderRight: `1px solid ${alpha('#FFFFFF', 0.08)}`,
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: 5 },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha('#FFFFFF', 0.14),
          borderRadius: 999,
          border: 'none',
        },
      }}
    >
      <SidebarBrand />

      <Box sx={{ px: 2.5, pt: 2.25 }}>
        <Button
          component={RouterLink}
          to="/lista?nuevo=1"
          fullWidth
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{
            bgcolor: brand.goldLight,
            color: brand.navy,
            fontSize: '.82rem',
            fontWeight: 700,
            minHeight: 44,
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#C9A73A', boxShadow: 'none' },
          }}
        >
          Nuevo pendiente
        </Button>
      </Box>

      <Box sx={{ px: 1.25, pt: 1.25, pb: 1, flex: 1 }}>
        {groups.map((group, groupIndex) => (
          <Box
            key={group.label}
            sx={{
              mt: groupIndex === 0 ? 1.5 : 2,
              pt: groupIndex === 0 ? 0 : 1.75,
              borderTop: groupIndex === 0 ? 'none' : `1px solid ${alpha('#FFFFFF', 0.065)}`,
            }}
          >
            <Typography
              component="p"
              sx={{
                px: 1.5,
                mb: 0.55,
                color: alpha('#FFFFFF', 0.55),
                fontSize: '.58rem',
                fontWeight: 700,
                letterSpacing: '.13em',
                textTransform: 'uppercase',
              }}
            >
              {group.label}
            </Typography>

            <Stack spacing={0.25}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item);
                return (
                  <Box
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      px: 1.5,
                      py: 1,
                      borderRadius: '6px',
                      color: active ? '#FFFFFF' : colors.onDarkMuted,
                      bgcolor: active ? alpha('#FFFFFF', 0.06) : 'transparent',
                      fontWeight: active ? 700 : 600,
                      fontSize: '.86rem',
                      textDecoration: 'none',
                      transition: 'background-color .16s ease, color .16s ease',
                      '&:hover': {
                        bgcolor: alpha('#FFFFFF', 0.04),
                        color: '#FFFFFF',
                        '& svg': { color: alpha('#FFFFFF', 0.82) },
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '22%',
                        bottom: '22%',
                        width: 2,
                        borderRadius: 1,
                        bgcolor: brand.goldLight,
                        opacity: active ? 1 : 0,
                        transition: 'opacity .16s ease',
                      },
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 19,
                        color: active ? brand.goldLight : alpha('#FFFFFF', 0.55),
                        transition: 'color .16s ease',
                      }}
                    />
                    {item.label}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 2.5, pb: 2.25, pt: 1.5 }}>
        <Divider sx={{ borderColor: alpha('#FFFFFF', 0.08), mb: 1.75 }} />
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'transparent',
              border: `1px solid ${alpha(brand.goldLight, 0.42)}`,
              color: brand.goldLight,
              fontSize: '.7rem',
              fontWeight: 700,
              letterSpacing: '.02em',
            }}
          >
            {initials(session?.name)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '.84rem', lineHeight: 1.2 }}>
              {session?.name ?? 'Usuario'}
            </Typography>
            <Typography noWrap sx={{ color: alpha('#FFFFFF', 0.5), fontSize: '.68rem', lineHeight: 1.3 }}>
              {roleLabel(session?.role)}
            </Typography>
          </Box>
          <Tooltip title="Cerrar sesión">
            <IconButton
              size="small"
              aria-label="Cerrar sesión"
              onClick={() => { logout(); nav('/login'); }}
              sx={{
                color: alpha('#FFFFFF', 0.45),
                borderRadius: '6px',
                '&:hover': { color: '#FFFFFF', bgcolor: alpha('#FFFFFF', 0.07) },
              }}
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
}
