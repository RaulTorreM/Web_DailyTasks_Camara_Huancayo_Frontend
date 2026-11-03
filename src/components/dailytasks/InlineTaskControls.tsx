import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Chip, CircularProgress, Menu, MenuItem, Stack, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type MouseEvent } from 'react';
import { changeTaskStatus, updateTask } from '../../api';
import type { DailyTask, DailyTaskPriority, DailyTaskStatus } from '../../api/types';
import { qk } from '../../api/queryClient';
import { taskPriority, taskStatus } from '../../theme/tokens';
import { priorityLabel, priorityOrder, statusLabel, statusOrder } from '../../utils/labels';

interface Props {
  task: DailyTask;
  disabled?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

/** Cambio rápido de estado y prioridad sin salir de la lista. */
export default function InlineTaskControls({ task, disabled = false, onSuccess, onError }: Props) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [priorityAnchor, setPriorityAnchor] = useState<HTMLElement | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    void queryClient.invalidateQueries({ queryKey: ['board'] });
    void queryClient.invalidateQueries({ queryKey: ['calendar'] });
    void queryClient.invalidateQueries({ queryKey: qk.summary });
    void queryClient.invalidateQueries({ queryKey: ['report'] });
    void queryClient.invalidateQueries({ queryKey: ['audit'] });
    void queryClient.invalidateQueries({ queryKey: qk.task(task.id) });
    void queryClient.invalidateQueries({ queryKey: qk.history(task.id) });
  };

  const statusMutation = useMutation({
    mutationFn: (status: DailyTaskStatus) => changeTaskStatus(task.id, { status }),
    onSuccess: () => {
      invalidate();
      onSuccess?.('Estado actualizado.');
    },
    onError: (err) => onError?.(err instanceof Error ? err.message : 'No se pudo cambiar el estado.'),
  });

  const priorityMutation = useMutation({
    mutationFn: (priority: DailyTaskPriority) =>
      updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority,
        dueDate: task.dueDate,
      }),
    onSuccess: () => {
      invalidate();
      onSuccess?.('Prioridad actualizada.');
    },
    onError: (err) => onError?.(err instanceof Error ? err.message : 'No se pudo cambiar la prioridad.'),
  });

  const busy = statusMutation.isPending || priorityMutation.isPending;
  const statusTone = taskStatus[task.status];
  const priorityTone = taskPriority[task.priority];

  const openStatus = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (disabled || busy) return;
    setStatusAnchor(event.currentTarget);
  };

  const openPriority = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (disabled || busy) return;
    setPriorityAnchor(event.currentTarget);
  };

  const chipSx = {
    height: 24,
    fontSize: '.68rem',
    fontWeight: 800,
    '& .MuiChip-icon': { fontSize: 15, ml: 0.5, mr: -0.5 },
  } as const;

  return (
    <Stack direction="row" alignItems="center" spacing={0.75} onClick={(e) => e.stopPropagation()}>
      <Tooltip title={disabled ? 'Solo el responsable o Gerencia puede modificarlo' : 'Cambiar estado'}>
        <span>
          <Chip
            size="small"
            label={statusLabel[task.status]}
            onClick={openStatus}
            clickable={!disabled && !busy}
            disabled={disabled || busy}
            icon={busy ? <CircularProgress size={12} color="inherit" /> : <ExpandMoreRoundedIcon />}
            sx={{
              ...chipSx,
              bgcolor: statusTone.soft,
              color: statusTone.main,
              border: `1px solid ${alpha(statusTone.main, theme.palette.mode === 'dark' ? 0.45 : 0.2)}`,
              '&.Mui-disabled': { opacity: disabled ? 0.75 : 1 },
            }}
          />
        </span>
      </Tooltip>

      <Tooltip title={disabled ? 'Solo el responsable o Gerencia puede modificarlo' : 'Cambiar prioridad'}>
        <span>
          <Chip
            size="small"
            label={priorityLabel[task.priority]}
            onClick={openPriority}
            clickable={!disabled && !busy}
            disabled={disabled || busy}
            icon={<ExpandMoreRoundedIcon />}
            sx={{
              ...chipSx,
              bgcolor: priorityTone.soft,
              color: priorityTone.main,
              border: `1px solid ${alpha(priorityTone.main, theme.palette.mode === 'dark' ? 0.45 : 0.2)}`,
              '&.Mui-disabled': { opacity: disabled ? 0.75 : 1 },
            }}
          />
        </span>
      </Tooltip>

      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => setStatusAnchor(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {statusOrder.map((value) => (
          <MenuItem
            key={value}
            selected={value === task.status}
            onClick={() => {
              setStatusAnchor(null);
              if (value !== task.status) statusMutation.mutate(value);
            }}
          >
            {statusLabel[value]}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={priorityAnchor}
        open={Boolean(priorityAnchor)}
        onClose={() => setPriorityAnchor(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {priorityOrder.map((value) => (
          <MenuItem
            key={value}
            selected={value === task.priority}
            onClick={() => {
              setPriorityAnchor(null);
              if (value !== task.priority) priorityMutation.mutate(value);
            }}
          >
            {priorityLabel[value]}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}
