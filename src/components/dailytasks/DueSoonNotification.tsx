import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTasks } from '../../api';
import { qk } from '../../api/queryClient';
import { useAuth } from '../../auth/AuthContext';
import { formatDueDate, tomorrowLima } from '../../utils/format';
import { priorityLabel } from '../../utils/labels';

/**
 * Aviso persistente en el header para pendientes personales que vencen mañana.
 * No muestra pendientes de otros usuarios.
 */
export default function DueSoonNotification() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const tomorrow = tomorrowLima();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

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

  if (dueTomorrow.length === 0) return null;

  const count = dueTomorrow.length;

  return (
    <>
      <Tooltip title={count === 1 ? '1 pendiente vence mañana' : `${count} pendientes vencen mañana`}>
        <IconButton
          aria-label="Notificaciones de vencimiento"
          onClick={(event) => setAnchor(event.currentTarget)}
          sx={{ color: 'warning.main' }}
        >
          <Badge badgeContent={count} color="warning" max={99}>
            <NotificationsActiveRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 320, maxWidth: 'calc(100vw - 24px)' } }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'warning.main', letterSpacing: '.1em' }}>
            Vencen mañana
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {formatDueDate(tomorrow)} · {count === 1 ? '1 pendiente' : `${count} pendientes`}
          </Typography>
        </Box>
        <Divider />
        {dueTomorrow.slice(0, 5).map((task) => (
          <MenuItem
            key={task.id}
            onClick={() => {
              setAnchor(null);
              navigate('/lista');
            }}
            sx={{ alignItems: 'flex-start', py: 1 }}
          >
            <Stack spacing={0.2} sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 800, fontSize: '.84rem' }}>
                {task.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {task.code} · {priorityLabel[task.priority]}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
        {count > 5 && (
          <Box sx={{ px: 2, py: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              +{count - 5} más
            </Typography>
          </Box>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            navigate('/lista');
          }}
          sx={{ fontWeight: 800, color: 'primary.main' }}
        >
          Ver mis pendientes
        </MenuItem>
      </Menu>
    </>
  );
}
