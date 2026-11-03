import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { BrandMark } from '../../components/layout/Brand';
import { useColorMode } from '../../theme/ColorModeContext';
import { brand, colors } from '../../theme/tokens';

const LAST_USER_KEY = 'dailytasks_last_user';

const FEATURES = [
  'Registro de pendientes por prioridad y fecha de vencimiento',
  'Consulta en lista, tablero y calendario',
  'Actualización de cambios en tiempo real',
];

export default function LoginPage() {
  const { session, login } = useAuth();
  const { mode, toggle } = useColorMode();
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Ingresar · DailyTasks CCH';
    const saved = localStorage.getItem(LAST_USER_KEY);
    if (saved) {
      setUsername(saved);
      setRemember(true);
    }
  }, []);

  if (session) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      if (remember) localStorage.setItem(LAST_USER_KEY, username.trim());
      else localStorage.removeItem(LAST_USER_KEY);
      nav('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo ingresar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ position: 'fixed', top: { xs: 12, md: 20 }, right: { xs: 12, md: 20 }, zIndex: 1400 }}>
        <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
          <IconButton
            onClick={toggle}
            aria-label={mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            sx={{
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              boxShadow: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Panel de marca (escritorio) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          color: '#FFFFFF',
          p: { md: 5, lg: 6 },
          bgcolor: brand.navyDeep,
          backgroundImage: [
            'radial-gradient(120% 90% at 0% 0%, rgba(33,36,116,0.55) 0%, rgba(10,10,36,0) 62%)',
            'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: 'auto, 88px 100%',
        }}
      >
        <Box
          component="img"
          src="/brand/logo-cch.png"
          alt="Cámara de Comercio de Huancayo"
          width={800}
          height={385}
          sx={{ width: 260, maxWidth: '72%', height: 'auto', position: 'relative' }}
        />

        <Box sx={{ my: 'auto', maxWidth: 870, position: 'relative', py: 5 }}>
          <Typography
            component="p"
            sx={{
              color: brand.goldLight,
              fontSize: '.68rem',
              fontWeight: 800,
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              mb: 1.75,
            }}
          >
            Sistema interno
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: 'clamp(2rem, 1.4rem + 1.8vw, 2.7rem)',
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
            }}
          >
            Gestión de pendientes diarios
          </Typography>
          <Typography sx={{ mt: 2.25, color: colors.onDarkMuted, fontSize: '.95rem', lineHeight: 1.65, maxWidth: 440 }}>
            Registro y seguimiento de los pendientes diarios de la Cámara de Comercio de Huancayo.
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 3.5 }}>
            {FEATURES.map((feature) => (
              <Stack key={feature} direction="row" alignItems="center" spacing={1.25}>
                <CheckCircleRoundedIcon sx={{ fontSize: 19, color: brand.goldLight, flexShrink: 0 }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.86)', fontSize: '.87rem' }}>{feature}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography sx={{ color: 'rgba(255,255,255,0.42)', fontSize: '.72rem', position: 'relative' }}>
          Cámara de Comercio de Huancayo · Desde 1924
        </Typography>
      </Box>

      {/* Formulario */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: { xs: '100dvh', md: 'auto' },
          px: { xs: 2.5, sm: 4, lg: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
            <BrandMark subtitle="Pendientes diarios" />
          </Box>

          <Typography
            variant="h1"
            sx={{ fontSize: { xs: '1.75rem', md: '1.9rem' }, mb: 0.5, letterSpacing: '-0.03em' }}
          >
            Iniciar sesión
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3.5 }}>
            Ingresa con tu cuenta de usuario.
          </Typography>

          <Box component="form" onSubmit={submit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              label="Usuario"
              fullWidth
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon fontSize="small" sx={{ color: colors.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Contraseña"
              fullWidth
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon fontSize="small" sx={{ color: colors.textMuted }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              sx={{ mt: 1.5 }}
              control={
                <Checkbox
                  size="small"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Recordar usuario</Typography>}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              disabled={loading || !username.trim() || !password}
              startIcon={loading ? <CircularProgress size={17} color="inherit" /> : undefined}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </Box>

          <Divider sx={{ my: 3.5 }} />

          <Typography variant="body2" color="text.secondary" align="center">
            Si tienes problemas para ingresar, contacta al administrador del sistema.
          </Typography>
          <Typography variant="caption" color="text.disabled" align="center" display="block" sx={{ mt: 2 }}>
            Cámara de Comercio de Huancayo · Perú
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
