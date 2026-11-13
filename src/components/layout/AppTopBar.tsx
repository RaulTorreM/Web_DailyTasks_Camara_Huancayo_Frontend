import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import ChangePasswordDialog from '../../features/auth/ChangePasswordDialog';
import DueSoonNotification from '../dailytasks/DueSoonNotification';
import { useColorMode } from '../../theme/ColorModeContext';
import { layout } from '../../theme/tokens';
import { initials, roleLabel } from '../../utils/user';
import { getPageMeta } from './navItems';

interface Props {
  /** Abre el menú lateral en móvil. */
  onOpenMenu: () => void;
}

/** Barra superior: contexto de la página, búsqueda global y cuenta. */
export default function AppTopBar({ onOpenMenu }: Props) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { session, logout } = useAuth();
  const { mode, toggle } = useColorMode();
  const meta = getPageMeta(pathname);

  const [query, setQuery] = useState('');
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) {
      nav('/lista');
      return;
    }
    nav(`/lista?q=${encodeURIComponent(term)}`);
    setQuery('');
  };

  return (
    <AppBar
      position="sticky"
      className="no-print"
      sx={{
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(22,26,42,0.92)' : 'rgba(255,255,255,0.9)',
        color: 'text.primary',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <Toolbar
        sx={{
          gap: { xs: 0.5, md: 1.5 },
          px: { xs: 1.5, md: 3 },
          minHeight: { xs: 60, md: 68 },
          width: '100%',
          maxWidth: layout.contentMax,
          mx: 'auto',
        }}
      >
        <IconButton
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          sx={{ display: { md: 'none' }, color: 'text.primary' }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0, display: { xs: 'none', md: 'block' } }}>
          <Typography
            noWrap
            sx={{ fontWeight: 800, fontSize: '1.02rem', color: 'text.primary', lineHeight: 1.2, letterSpacing: '-0.015em' }}
          >
            {meta.title}
          </Typography>
          <Typography noWrap variant="caption" sx={{ color: 'text.secondary', fontSize: '.72rem' }}>
            {meta.section} 
          </Typography>
        </Box>

        <Typography
          noWrap
          sx={{ display: { md: 'none' }, flex: 1, fontWeight: 800, fontSize: '.98rem', color: 'text.primary' }}
        >
          {meta.title}
        </Typography>

        <Box
          component="form"
          onSubmit={submitSearch}
          role="search"
          sx={{ display: { xs: 'none', sm: 'block' }, width: { sm: 210, lg: 300 } }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar pendiente…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            inputProps={{ 'aria-label': 'Buscar pendiente' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'action.hover', border: '1px solid transparent' } }}
          />
        </Box>

        <Tooltip title="Buscar pendiente">
          <IconButton
            onClick={() => nav('/lista')}
            aria-label="Buscar pendiente"
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: 'text.primary' }}
          >
            <SearchRoundedIcon />
          </IconButton>
        </Tooltip>

        <DueSoonNotification />

        <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
          <IconButton
            onClick={toggle}
            aria-label={mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            sx={{ color: 'text.primary' }}
          >
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Cuenta">
          <IconButton
            onClick={(e) => setAnchor(e.currentTarget)}
            aria-label="Abrir menú de cuenta"
            sx={{ display: { xs: 'none', md: 'inline-flex' }, ml: 0.5 }}
          >
            <Avatar sx={{ width: 36, height: 36, fontSize: '.78rem' }}>{initials(session?.name)}</Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchor}
          open={!!anchor}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ px: 2, py: 1.25, minWidth: 216 }}>
            <Typography noWrap sx={{ fontWeight: 800, fontSize: '.88rem' }}>
              {session?.name ?? 'Usuario'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {roleLabel(session?.role)}
            </Typography>
            <Typography variant="caption" color="text.disabled" display="block">
              {session?.areaName ?? 'Cámara de Comercio'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchor(null); setPasswordOpen(true); }}>
            <LockResetRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />
            Cambiar contraseña
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setAnchor(null); logout(); nav('/login'); }}>
            <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />
            Cerrar sesión
          </MenuItem>
        </Menu>

        <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
      </Toolbar>
    </AppBar>
  );
}
