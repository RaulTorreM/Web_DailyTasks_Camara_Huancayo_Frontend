import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Alert, Button, Snackbar } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTasks } from '../../api';
import { qk } from '../../api/queryClient';
import { useAuth } from '../../auth/AuthContext';
import { tomorrowLima } from '../../utils/format';

/**
 * Aviso personal: pendientes que vencen mañana.
 * No muestra tareas del equipo; consulta únicamente las asignadas al usuario.
 */
export default function DueSoonAlarm() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const tomorrow = tomorrowLima();
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  const query = useQuery({
    queryKey: qk.tasks({ alarm: 'dueTomorrow', userId: session?.id, date: tomorrow }),
    queryFn: () =>
      listTasks({
        assignedToId: session?.id,
        dueDate: tomorrow,
        pageSize: 100,
        sortBy: 'dueDate',
        sortDir: 'asc',
      }),
    enabled: session?.id != null,
    staleTime: 60_000,
  });

  const dueTomorrow = useMemo(
    () => (query.data?.items ?? []).filter((task) => task.status !== 'Done' && task.dueDate === tomorrow),
    [query.data, tomorrow],
  );

  const open = dueTomorrow.length > 0 && dismissedFor !== tomorrow;

  return (
    <Snackbar
      open={open}
      autoHideDuration={15000}
      onClose={() => setDismissedFor(tomorrow)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity="warning"
        variant="filled"
        icon={<WarningAmberRoundedIcon />}
        onClose={() => setDismissedFor(tomorrow)}
        action={
          <Button color="inherit" size="small" onClick={() => navigate('/lista')}>
            Ver pendientes
          </Button>
        }
        sx={{ alignItems: 'center' }}
      >
        {dueTomorrow.length === 1
          ? `“${dueTomorrow[0].title}” vence mañana.`
          : `Tienes ${dueTomorrow.length} pendientes que vencen mañana.`}
      </Alert>
    </Snackbar>
  );
}
