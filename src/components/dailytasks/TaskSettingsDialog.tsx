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
  const [limit, setLimit] = useState('7');
  const [error, setError] = useState('');

  const settingsQuery = useQuery({
    queryKey: qk.settings,
    queryFn: getTaskSettings,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setError('');
    if (settingsQuery.data) setLimit(String(settingsQuery.data.userPendingLimit));
  }, [open, settingsQuery.data]);

  const mutation = useMutation({
    mutationFn: () => updateTaskSettings(Number(limit)),
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
    const parsed = Number(limit);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 999) {
      setError('El límite debe ser un número entero entre 0 y 999 pendientes.');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Límite de pendientes por usuario</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Define cuántos pendientes activos puede tener cada usuario. Pueden elegir cualquier fecha
            de vencimiento. Gerencia General no tiene este límite.
          </Typography>
          <TextField
            label="Pendientes permitidos"
            type="number"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            inputProps={{ min: 0, max: 999 }}
            helperText="Ejemplo: 2 permite tener 2 pendientes activos por usuario."
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
