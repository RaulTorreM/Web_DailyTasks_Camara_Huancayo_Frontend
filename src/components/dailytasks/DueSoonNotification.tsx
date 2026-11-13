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
  listAllTasks,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api';
import type { DailyTask } from '../../api/types';
import { qk } from '../../api/queryClient';
import { useAuth } from '../../auth/AuthContext';
import { formatDateTime, formatDueDate, todayLima, tomorrowLima } from '../../utils/format';
import { priorityLabel } from '../../utils/labels';

/**
 * Campana persistente del header.
 * Incluye los pendientes que están por vencer (hoy, mañana y los creados en días
 * anteriores que todavía no vencen) y las notificaciones de asignación.
 */
export default function DueSoonNotification() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = todayLima();
  const tomorrow = tomorrowLima();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const dueSoonQuery = useQuery({
    queryKey: qk.tasks({ alarm: 'dueSoon', userId: session?.id, today, tomorrow }),
    queryFn: () =>
      listAllTasks({
        assignedToId: session?.id,
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

  // Se mantienen los vencimientos de hoy y mañana para cualquier pendiente, y
  // también los creados en días anteriores mientras aún no venzan.
  const dueSoon = useMemo(
    () =>
      (dueSoonQuery.data ?? [])
        .filter(
          (task) =>
            task.status !== 'Done' &&
            !task.isDeleted &&
            task.dueDate >= today &&
            (task.dueDate <= tomorrow || task.createdOn < today),
        )
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.code.localeCompare(b.code)),
    [dueSoonQuery.data, today, tomorrow],
  );

  const dueToday = dueSoon.filter((task) => task.dueDate === today);
  const dueTomorrow = dueSoon.filter((task) => task.dueDate === tomorrow);
  const dueLater = dueSoon.filter((task) => task.dueDate > tomorrow);

  const notifications = notificationsQuery.data ?? [];
  const unread = notifications.filter((item) => item.readAt == null);
  const totalCount = dueSoon.length + unread.length;
  const hasAlerts = totalCount > 0;

  const openTaskList = () => {
    setAnchor(null);
    navigate('/lista');
  };

  const renderTask = (task: DailyTask, showDueDate = false) => (
    <MenuItem
      key={`due-${task.id}`}
      onClick={openTaskList}
      sx={{ alignItems: 'flex-start', py: 1 }}
    >
      <Stack spacing={0.2} sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: '.84rem' }}>
          {task.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {task.code} · {priorityLabel[task.priority]}
          {showDueDate ? ` · vence ${formatDueDate(task.dueDate)}` : ''}
        </Typography>
      </Stack>
    </MenuItem>
  );

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

        {dueToday.length > 0 && (
          <>
            <Box sx={{ px: 2, pt: 1.25, pb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>
                VENCEN HOY · {formatDueDate(today)}
              </Typography>
            </Box>
            {dueToday.slice(0, 5).map((task) => renderTask(task))}
          </>
        )}

        {dueTomorrow.length > 0 && (
          <>
            {dueToday.length > 0 && <Divider sx={{ my: 0.5 }} />}
            <Box sx={{ px: 2, pt: 1.25, pb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.main' }}>
                VENCEN MAÑANA · {formatDueDate(tomorrow)}
              </Typography>
            </Box>
            {dueTomorrow.slice(0, 5).map((task) => renderTask(task))}
          </>
        )}

        {dueLater.length > 0 && (
          <>
            {(dueToday.length > 0 || dueTomorrow.length > 0) && <Divider sx={{ my: 0.5 }} />}
            <Box sx={{ px: 2, pt: 1.25, pb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.main' }}>
                PRÓXIMOS VENCIMIENTOS
              </Typography>
            </Box>
            {dueLater.slice(0, 5).map((task) => renderTask(task, true))}
          </>
        )}

        {notifications.length > 0 && (
          <>
            {dueSoon.length > 0 && <Divider sx={{ my: 0.5 }} />}
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
