import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { createTask, listUsers, updateTask } from '../../../api';
import type { DailyTask, DailyTaskPriority } from '../../../api/types';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { isManager } from '../../../auth/permissions';
import { priorityLabel, priorityOrder } from '../../../utils/labels';
import { todayLima } from '../../../utils/format';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Si se envía, el diálogo edita; si no, crea. */
  task?: DailyTask | null;
  /** Fecha inicial al crear, por ejemplo el día seleccionado en el calendario. */
  initialDueDate?: string;
  onSaved?: () => void;
}

export default function TaskFormDialog({ open, onClose, task, initialDueDate, onSaved }: Props) {
  const { session } = useAuth();
  const manager = isManager(session);
  const queryClient = useQueryClient();
  const today = todayLima();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<DailyTaskPriority>('Medium');
  const [dueDate, setDueDate] = useState(initialDueDate ?? today);
  const [assignedToId, setAssignedToId] = useState<number>(session?.id ?? 0);
  const [error, setError] = useState('');

  const usersQuery = useQuery({
    queryKey: qk.users(),
    queryFn: () => listUsers(),
    enabled: open && manager,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!open) return;
    setError('');
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setAssignedToId(task.assignedToId);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate(initialDueDate ?? today);
      setAssignedToId(session?.id ?? 0);
    }
  }, [open, task, initialDueDate, today, session?.id]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate,
      };
      if (task) return updateTask(task.id, payload);
      return createTask({
        ...payload,
        assignedToId: manager ? assignedToId : undefined,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['board'] });
      void queryClient.invalidateQueries({ queryKey: ['calendar'] });
      void queryClient.invalidateQueries({ queryKey: qk.summary });
      void queryClient.invalidateQueries({ queryKey: ['report'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
      onSaved?.();
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el pendiente.');
    },
  });

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (mutation.isPending) return;
    setError('');
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (title.trim().length > 200) {
      setError('El título no puede superar los 200 caracteres.');
      return;
    }
    if (description.length > 2000) {
      setError('La descripción no puede superar los 2000 caracteres.');
      return;
    }
    if (!dueDate) {
      setError('Indica la fecha de vencimiento.');
      return;
    }
    if (manager && !assignedToId) {
      setError('Selecciona un responsable.');
      return;
    }
    mutation.mutate();
  };

  const close = () => {
    if (mutation.isPending) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{task ? 'Editar pendiente' : 'Nuevo pendiente'}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} onSubmit={submit} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Título"
            fullWidth
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            inputProps={{ maxLength: 200 }}
            helperText={`${title.length}/200`}
            disabled={mutation.isPending}
          />

          <TextField
            label="Descripción"
            fullWidth
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            inputProps={{ maxLength: 2000 }}
            helperText={`${description.length}/2000`}
            disabled={mutation.isPending}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="task-priority-label">Prioridad</InputLabel>
              <Select
                labelId="task-priority-label"
                label="Prioridad"
                value={priority}
                onChange={(e) => setPriority(e.target.value as DailyTaskPriority)}
                disabled={mutation.isPending}
              >
                {priorityOrder.map((value) => (
                  <MenuItem key={value} value={value}>
                    {priorityLabel[value]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Fecha de vencimiento"
              type="date"
              fullWidth
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={mutation.isPending}
            />
          </Stack>

          {manager && (
            <FormControl fullWidth>
              <InputLabel id="task-assignee-label">Responsable</InputLabel>
              <Select
                labelId="task-assignee-label"
                label="Responsable"
                value={assignedToId}
                onChange={(e) => setAssignedToId(Number(e.target.value))}
                disabled={mutation.isPending || usersQuery.isLoading}
              >
                {(usersQuery.data ?? []).map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName} · {user.areaName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => submit()}
          disabled={mutation.isPending || !title.trim()}
          startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {mutation.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
