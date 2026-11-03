import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Avatar, Box, Button, Divider, Drawer, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import ChangePasswordDialog from '../../features/auth/ChangePasswordDialog';
import { initials, roleLabel } from '../../utils/user';
import { BrandMark } from './Brand';
import { isActive, navGroupsFor } from './navItems';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Menú completo en móvil (se abre con el botón "Más" o la hamburguesa). */
export default function MobileMenu({ open, onClose }: Props) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { session, logout } = useAuth();
  const groups = navGroupsFor(session?.role);
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <>
      <Drawer
        anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: 312,
          maxWidth: '86vw',
          bgcolor: theme.palette.background.default,
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.75,
            bgcolor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <BrandMark />
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={onClose} aria-label="Cerrar menú">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar sx={{ width: 40, height: 40, fontSize: '.85rem' }}>{initials(session?.name)}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 800, fontSize: '.88rem', lineHeight: 1.2 }}>
                {session?.name ?? 'Usuario'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {roleLabel(session?.role)}
              </Typography>
            </Box>
          </Stack>

          {groups.map((group) => (
            <Box key={group.label} sx={{ mt: 2.5 }}>
              <Typography
                component="p"
                sx={{
                  px: 1.5,
                  mb: 0.75,
                  color: theme.palette.text.disabled,
                  fontSize: '.64rem',
                  fontWeight: 800,
                  letterSpacing: '.14em',
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
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1.2,
                        borderRadius: 2.5,
                        color: active ? theme.palette.primary.main : theme.palette.text.primary,
                        bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                        fontWeight: active ? 800 : 600,
                        fontSize: '.9rem',
                        textDecoration: 'none',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                      }}
                    >
                      <Icon sx={{ fontSize: 21, color: active ? theme.palette.primary.main : theme.palette.text.secondary }} />
                      {item.label}
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Divider sx={{ mb: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LockResetRoundedIcon />}
            onClick={() => { onClose(); setPasswordOpen(true); }}
            sx={{ mb: 1 }}
          >
            Cambiar contraseña
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutRoundedIcon />}
            onClick={() => { onClose(); logout(); nav('/login'); }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Box>
      </Drawer>
      <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
}
