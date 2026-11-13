import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getTaskSettings, updateTaskSettings } from '../../api';
import { qk } from '../../api/queryClient';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TaskSettingsDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [days, setDays] = useState('7');
  const [error, setError] = useState('');

  const settingsQuery = useQuery({
    queryKey: qk.settings,
    queryFn: getTaskSettings,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setError('');
    if (settingsQuery.data) setDays(String(settingsQuery.data.userDueDateWindowDays));
  }, [open, settingsQuery.data]);

  const mutation = useMutation({
    mutationFn: () => updateTaskSettings(Number(days)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.settings });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración.');
    },
  });

  const save = () => {
    setError('');
    const parsed = Number(days);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 365) {
      setError('El límite debe ser un número entre 0 y 365 días.');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Límite de días para usuarios</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Los usuarios podrán crear pendientes con vencimiento entre hoy y dentro de la cantidad de
            días indicada. Gerencia General no tiene este límite y puede usar cualquier fecha.
          </Typography>
          <TextField
            label="Días permitidos"
            type="number"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            inputProps={{ min: 0, max: 365 }}
            helperText="Ejemplo: 2 permite hoy, mañana y pasado mañana."
            disabled={settingsQuery.isLoading || mutation.isPending}
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={mutation.isPending || settingsQuery.isLoading}
          startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {mutation.isPending ? 'Guardando…' : 'Guardar límite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
