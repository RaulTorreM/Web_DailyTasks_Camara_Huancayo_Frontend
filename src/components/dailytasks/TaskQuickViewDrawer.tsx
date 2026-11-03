import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { deleteTask, getTask } from '../../api';
import type { DailyTask } from '../../api/types';
import { qk } from '../../api/queryClient';
import { useAuth } from '../../auth/AuthContext';
import { canDeleteTask, canEditTask, isManager } from '../../auth/permissions';
import { colors } from '../../theme/tokens';
import { formatDateTime, formatDueDate } from '../../utils/format';
import AssigneeBadge from './AssigneeBadge';
import ConfirmDialog from './ConfirmDialog';
import InlineTaskControls from './InlineTaskControls';
import TaskHistoryDrawer from './TaskHistoryDrawer';

interface Props {
  open: boolean;
  taskId: number | null;
  onClose: () => void;
  onEdit?: (task: DailyTask) => void;
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ py: 0.75 }}>
      <Typography sx={{ width: 112, flexShrink: 0, fontSize: '.76rem', fontWeight: 800, color: colors.textSecondary }}>
        {label}
      </Typography>
      <Box sx={{ minWidth: 0, flex: 1 }}>{children}</Box>
    </Stack>
  );
}

export default function TaskQuickViewDrawer({ open, taskId, onClose, onEdit }: Props) {
  const theme = useTheme();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toast, setToast] = useState('');

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: (_result, id) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['board'] });
      void queryClient.invalidateQueries({ queryKey: ['calendar'] });
      void queryClient.invalidateQueries({ queryKey: qk.summary });
      void queryClient.invalidateQueries({ queryKey: ['report'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
      queryClient.removeQueries({ queryKey: qk.task(id) });
      setConfirmDeleteOpen(false);
      setToast('Pendiente enviado a la papelera.');
      onClose();
    },
    onError: (err) => {
      setConfirmDeleteOpen(false);
      setToast(err instanceof Error ? err.message : 'No se pudo eliminar el pendiente.');
    },
  });

  const taskQuery = useQuery({
    queryKey: qk.task(taskId ?? ''),
    queryFn: () => getTask(taskId as number),
    enabled: open && taskId != null,
  });

  const task = taskQuery.data;
  const canEdit = task ? canEditTask(session, task) && !task.isDeleted : false;
  const canDelete = task ? canDeleteTask(session) && !task.isDeleted : false;
  const canViewHistory = task
    ? isManager(session) || (task.assignedToId === session?.id && !task.isDeleted)
    : false;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100vw' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontWeight: 800 }}>
              {task?.code ?? 'Pendiente'}
            </Typography>
            <Typography variant="h3" sx={{ fontSize: '1.12rem', mt: 0.25, lineHeight: 1.25 }}>
              {task?.title ?? 'Cargando…'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Cerrar vista rápida">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 2.5 }, overflowY: 'auto' }}>
          {taskQuery.isLoading ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
              <CircularProgress size={26} />
              <Typography variant="body2" color="text.secondary">
                Cargando pendiente…
              </Typography>
            </Stack>
          ) : taskQuery.isError || !task ? (
            <Alert severity="error">No se pudo cargar el pendiente.</Alert>
          ) : (
            <>
              {task.isDeleted ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Este pendiente está eliminado. Puedes consultar su historial, pero no modificarlo.
                </Alert>
              ) : !canEdit ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Solo el responsable o Gerencia General puede modificar este pendiente.
                </Alert>
              ) : null}

              <Box sx={{ mb: 2 }}>
                <InlineTaskControls
                  task={task}
                  disabled={!canEdit}
                  onSuccess={setToast}
                  onError={setToast}
                />
              </Box>

              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: theme.palette.text.primary, lineHeight: 1.65 }}>
                {task.description || 'Sin descripción.'}
              </Typography>

              <Divider sx={{ my: 2.5 }} />

              <MetaRow label="Responsable">
                <AssigneeBadge
                  name={task.assignedToName}
                  areaName={task.areaName}
                  isCurrentUser={task.assignedToId === session?.id}
                  showArea
                />
              </MetaRow>
              <MetaRow label="Área">
                <Typography variant="body2">{task.areaName}</Typography>
              </MetaRow>
              <MetaRow label="Vencimiento">
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 800, color: task.isOverdue ? theme.palette.error.main : theme.palette.text.primary }}
                >
                  {formatDueDate(task.dueDate)}
                  {task.isOverdue && task.daysOverdue > 0 ? ` · ${task.daysOverdue} d vencido` : ''}
                </Typography>
              </MetaRow>
              <MetaRow label="Creado">
                <Typography variant="body2" color="text.secondary">
                  {task.createdByName} · {formatDateTime(task.createdAt)}
                </Typography>
              </MetaRow>
              {task.completedAt && (
                <MetaRow label="Completado">
                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(task.completedAt)}
                  </Typography>
                </MetaRow>
              )}

              <Divider sx={{ my: 2.5 }} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {canEdit && onEdit && (
                  <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={() => onEdit(task)}>
                    Editar pendiente
                  </Button>
                )}
                {canViewHistory ? (
                  <Button variant="outlined" startIcon={<HistoryRoundedIcon />} onClick={() => setHistoryOpen(true)}>
                    Ver historial
                  </Button>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    
                  </Typography>
                )}
                {canDelete && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={() => setConfirmDeleteOpen(true)}
                    disabled={deleteMutation.isPending}
                  >
                    Eliminar pendiente
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Box>
      </Drawer>

      <TaskHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        taskId={task?.id ?? null}
        taskTitle={task?.title}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="¿Eliminar pendiente?"
        message={`“${task?.title ?? ''}” se enviará a la papelera. Gerencia General podrá restaurarlo más adelante.`}
        confirmLabel="Sí, eliminar"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (task) deleteMutation.mutate(task.id);
        }}
        onClose={() => setConfirmDeleteOpen(false)}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </>
  );
}
