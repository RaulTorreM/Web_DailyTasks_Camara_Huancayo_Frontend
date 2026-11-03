import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { listTasks, restoreTask } from '../../../api';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { isManager } from '../../../auth/permissions';
import EmptyState from '../../../components/common/EmptyState';
import PageLoader from '../../../components/common/PageLoader';
import { TaskPriorityChip } from '../../../components/common/StatusChips';
import { formatDateTime } from '../../../utils/format';

export default function PapeleraPage() {
  const theme = useTheme();
  const { session } = useAuth();
  const manager = isManager(session);
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');

  const deletedQuery = useQuery({
    queryKey: qk.tasks({ includeDeleted: true }),
    queryFn: () => listTasks({ includeDeleted: true, pageSize: 100 }),
    enabled: manager,
  });

  const restore = useMutation({
    mutationFn: (id: number) => restoreTask(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['board'] });
      void queryClient.invalidateQueries({ queryKey: ['calendar'] });
      void queryClient.invalidateQueries({ queryKey: qk.summary });
      void queryClient.invalidateQueries({ queryKey: ['report'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
      setToast('Pendiente restaurado.');
    },
    onError: (err) => {
      setToast(err instanceof Error ? err.message : 'No se pudo restaurar el pendiente.');
    },
  });

  if (!manager) {
    return (
      <Alert severity="warning">
        Solo Gerencia General puede ver y restaurar pendientes eliminados.
      </Alert>
    );
  }

  if (deletedQuery.isLoading && !deletedQuery.data) return <PageLoader />;

  if (deletedQuery.isError && !deletedQuery.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void deletedQuery.refetch()}>
            Reintentar
          </Button>
        }
      >
        No se pudo cargar la papelera.
      </Alert>
    );
  }

  const items = (deletedQuery.data?.items ?? []).filter((task) => task.isDeleted);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.35rem', md: '1.55rem' } }}>
            Papelera
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            Pendientes eliminados. Puedes restaurarlos para que vuelvan al tablero.
          </Typography>
        </Box>
      </Stack>

      {items.length === 0 ? (
        <Card variant="outlined">
          <EmptyState
            icon={DeleteSweepRoundedIcon}
            title="La papelera está vacía"
            description="Los pendientes eliminados aparecerán aquí y podrás restaurarlos."
          />
        </Card>
      ) : (
        <Card variant="outlined">
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Pendiente</TableCell>
                  <TableCell>Prioridad</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Eliminado</TableCell>
                  <TableCell>Eliminado por</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap', color: theme.palette.text.secondary, fontWeight: 700 }}>
                      {task.code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{task.title}</TableCell>
                    <TableCell><TaskPriorityChip priority={task.priority} /></TableCell>
                    <TableCell>{task.areaName}</TableCell>
                    <TableCell>{task.assignedToName}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {task.deletedAt ? formatDateTime(task.deletedAt) : '—'}
                    </TableCell>
                    <TableCell>{task.deletedByName ?? '—'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Restaurar pendiente">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label={`Restaurar ${task.title}`}
                            disabled={restore.isPending}
                            onClick={() => restore.mutate(task.id)}
                          >
                            {restore.isPending ? (
                              <CircularProgress size={18} />
                            ) : (
                              <RestoreRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}
