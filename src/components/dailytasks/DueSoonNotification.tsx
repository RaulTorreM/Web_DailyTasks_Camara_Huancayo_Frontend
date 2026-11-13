import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  listTasks,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api';
import { qk } from '../../api/queryClient';
import { useAuth } from '../../auth/AuthContext';
import { formatDateTime, formatDueDate, tomorrowLima } from '../../utils/format';
import { priorityLabel } from '../../utils/labels';

/**
 * Campana persistente del header.
 * Incluye vencimientos de mañana y notificaciones de asignación.
 */
export default function DueSoonNotification() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tomorrow = tomorrowLima();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const dueSoonQuery = useQuery({
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

  const notificationsQuery = useQuery({
    queryKey: qk.notifications,
    queryFn: getNotifications,
    enabled: session?.id != null,
    refetchInterval: 60_000,
    staleTime: 20_000,
  });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: qk.notifications }),
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: qk.notifications }),
  });

  const dueTomorrow = useMemo(
    () => (dueSoonQuery.data?.items ?? []).filter((task) => task.status !== 'Done' && task.dueDate === tomorrow),
    [dueSoonQuery.data, tomorrow],
  );

  const notifications = notificationsQuery.data ?? [];
  const unread = notifications.filter((item) => item.readAt == null);
  const totalCount = dueTomorrow.length + unread.length;
  const hasAlerts = totalCount > 0;

  const openTaskList = () => {
    setAnchor(null);
    navigate('/lista');
  };

  return (
    <>
      <Tooltip title={hasAlerts ? `${totalCount} notificaciones` : 'Sin notificaciones'}>
        <IconButton
          aria-label="Notificaciones"
          onClick={(event) => setAnchor(event.currentTarget)}
          sx={{ color: hasAlerts ? 'warning.main' : 'text.primary' }}
        >
          {hasAlerts ? (
            <Badge badgeContent={totalCount} color="warning" max={99}>
              <NotificationsActiveRoundedIcon />
            </Badge>
          ) : (
            <NotificationsNoneRoundedIcon />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 350, maxWidth: 'calc(100vw - 24px)' } }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '.1em' }}>
            Notificaciones
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {hasAlerts
              ? `${totalCount} ${totalCount === 1 ? 'aviso pendiente' : 'avisos pendientes'}`
              : 'Todo al día'}
          </Typography>
        </Box>
        <Divider />

        {dueTomorrow.length > 0 && (
          <>
            <Box sx={{ px: 2, pt: 1.25, pb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.main' }}>
                VENCEN MAÑANA · {formatDueDate(tomorrow)}
              </Typography>
            </Box>
            {dueTomorrow.slice(0, 5).map((task) => (
              <MenuItem key={`due-${task.id}`} onClick={openTaskList} sx={{ alignItems: 'flex-start', py: 1 }}>
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
          </>
        )}

        {notifications.length > 0 && (
          <>
            {dueTomorrow.length > 0 && <Divider sx={{ my: 0.5 }} />}
            <Box sx={{ px: 2, pt: 1.25, pb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                ASIGNACIONES
              </Typography>
            </Box>
            {notifications.slice(0, 5).map((item) => (
              <MenuItem
                key={`notification-${item.id}`}
                onClick={() => {
                  if (item.readAt == null) markRead.mutate(item.id);
                  openTaskList();
                }}
                sx={{ alignItems: 'flex-start', py: 1, whiteSpace: 'normal' }}
              >
                <Stack spacing={0.25} sx={{ minWidth: 0, width: '100%' }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    {item.readAt == null && (
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'warning.main', flexShrink: 0 }} />
                    )}
                    <Typography
                      noWrap
                      sx={{ fontWeight: item.readAt == null ? 800 : 600, fontSize: '.84rem' }}
                    >
                      {item.taskTitle}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ lineHeight: 1.35, whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    {item.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {formatDateTime(item.createdAt)}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </>
        )}

        {!hasAlerts && notifications.length === 0 && (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No tienes notificaciones por ahora.
            </Typography>
          </Box>
        )}

        <Divider sx={{ mt: 0.5 }} />
        {unread.length > 0 && (
          <MenuItem
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            sx={{ fontWeight: 700 }}
          >
            <MarkEmailReadRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />
            Marcar todas como leídas
          </MenuItem>
        )}
        <MenuItem onClick={openTaskList} sx={{ fontWeight: 800, color: 'primary.main' }}>
          Ver mis pendientes
        </MenuItem>
      </Menu>
    </>
  );
}
