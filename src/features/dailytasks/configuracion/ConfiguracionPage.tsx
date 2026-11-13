import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getTaskSettings, updateTaskSettings } from '../../../api';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { isManager } from '../../../auth/permissions';
import PageLoader from '../../../components/common/PageLoader';
import { isCreationAllowedNow, scheduleLabel, toHm } from '../../../utils/schedule';

export default function ConfiguracionPage() {
  const theme = useTheme();
  const { session } = useAuth();
  const manager = isManager(session);
  const queryClient = useQueryClient();

  const [start, setStart] = useState('08:30');
  const [end, setEnd] = useState('19:00');
  const [allowWeekend, setAllowWeekend] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const settingsQuery = useQuery({
    queryKey: qk.settings,
    queryFn: getTaskSettings,
    enabled: manager,
  });

  useEffect(() => {
    const data = settingsQuery.data;
    if (!data) return;
    setStart(toHm(data.creationStartTime));
    setEnd(toHm(data.creationEndTime));
    setAllowWeekend(data.allowWeekendCreation);
  }, [settingsQuery.data]);

  const mutation = useMutation({
    mutationFn: () =>
      updateTaskSettings({
        creationStartTime: `${start}:00`,
        creationEndTime: `${end}:00`,
        allowWeekendCreation: allowWeekend,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(qk.settings, data);
      setError('');
      setToast('Configuración guardada.');
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración.');
    },
  });

  const save = () => {
    setError('');
    if (!start || !end) {
      setError('Indica la hora de inicio y la hora de fin.');
      return;
    }
    if (start >= end) {
      setError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }
    mutation.mutate();
  };

  if (!manager) return <Navigate to="/" replace />;

  if (settingsQuery.isLoading && !settingsQuery.data) return <PageLoader />;

  if (settingsQuery.isError && !settingsQuery.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void settingsQuery.refetch()}>
            Reintentar
          </Button>
        }
      >
        No se pudo cargar la configuración.
      </Alert>
    );
  }

  const preview = { creationStartTime: start, creationEndTime: end, allowWeekendCreation: allowWeekend };
  const allowedNow = isCreationAllowedNow(preview);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 0.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: theme.palette.action.hover,
            color: theme.palette.primary.main,
          }}
        >
          <ScheduleRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.35rem', md: '1.55rem' } }}>
            Configuración
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2 }}>
            Horario en que los usuarios pueden crear pendientes.
          </Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ mt: 2.5 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Alert severity="info">
              No hay límite de cantidad de pendientes ni de fecha de vencimiento. Solo se controla
              la hora y el día en que los usuarios pueden crearlos. Gerencia General puede crear
              pendientes siempre, sin importar el horario.
            </Alert>

            {error && <Alert severity="error">{error}</Alert>}

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.25 }}>
                Horario de creación
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Desde"
                  type="time"
                  fullWidth
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 60 }}
                  disabled={mutation.isPending}
                />
                <TextField
                  label="Hasta"
                  type="time"
                  fullWidth
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 60 }}
                  disabled={mutation.isPending}
                />
              </Stack>
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowWeekend}
                    onChange={(event) => setAllowWeekend(event.target.checked)}
                    disabled={mutation.isPending}
                  />
                }
                label="Permitir crear pendientes los sábados y domingos"
              />
              <Typography variant="body2" color="text.secondary">
                Si está desactivado, la creación solo funciona de lunes a viernes dentro del horario.
              </Typography>
            </Box>

            <Divider />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <Chip
                size="small"
                color={allowedNow ? 'success' : 'default'}
                label={`Con este horario, ahora: ${allowedNow ? 'habilitado' : 'fuera de horario'}`}
              />
              <Chip size="small" variant="outlined" label={scheduleLabel(preview)} />
            </Stack>

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={save}
                disabled={mutation.isPending}
                startIcon={
                  mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined
                }
              >
                {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        message={toast}
        onClose={() => setToast('')}
      />
    </Box>
  );
}
