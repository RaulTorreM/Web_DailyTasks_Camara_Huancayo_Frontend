import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getChanges } from '../api';
import { invalidateTaskViews } from '../api/queryClient';
import { useAuth } from '../auth/AuthContext';

interface TaskPayload {
  id?: number;
}

interface DeletedPayload {
  taskId?: number;
}

/**
 * Conecta el tablero en tiempo real.
 *
 * SignalR es la vía principal. Si no conecta (o se cae), se activa un polling
 * de respaldo cada 25 s contra /tasks/changes para no perder actualizaciones.
 */
export function useDailyTasksHub() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session?.token) return;

    const configured = import.meta.env.VITE_HUB_URL ?? '/hubs/dailytasks';
    const hubUrl = configured.startsWith('http')
      ? configured
      : `${window.location.origin}${configured}`;

    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(`${hubUrl}?access_token=${encodeURIComponent(session.token)}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    let pollTimer: number | undefined;
    let lastSync = new Date(Date.now() - 60_000).toISOString();
    let disposed = false;

    const refresh = (taskId?: number) => {
      invalidateTaskViews(queryClient, taskId);
    };

    const poll = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const changes = await getChanges(lastSync);
        lastSync = new Date().toISOString();
        if (changes.tasks.length > 0 || changes.deletedTaskIds.length > 0) {
          refresh();
        }
      } catch {
        // El polling es best-effort; un fallo no debe interrumpir la app.
      }
    };

    const startPolling = () => {
      if (pollTimer != null) return;
      pollTimer = window.setInterval(() => void poll(), 25_000);
    };

    const stopPolling = () => {
      if (pollTimer == null) return;
      window.clearInterval(pollTimer);
      pollTimer = undefined;
    };

    connection.on('taskCreated', (task: TaskPayload) => refresh(task?.id));
    connection.on('taskUpdated', (task: TaskPayload) => refresh(task?.id));
    connection.on('taskStatusChanged', (task: TaskPayload) => refresh(task?.id));
    connection.on('taskAssigned', (task: TaskPayload) => refresh(task?.id));
    connection.on('taskDeleted', (payload: DeletedPayload) => refresh(payload?.taskId));
    connection.on('taskRestored', (task: TaskPayload) => refresh(task?.id));

    connection.onreconnected(() => {
      stopPolling();
      refresh();
    });

    connection.onclose(() => {
      if (!disposed) startPolling();
    });

    // Respaldo desde el inicio; si SignalR conecta, se detiene.
    startPolling();
    connection
      .start()
      .then(() => {
        if (connection.state === HubConnectionState.Connected) stopPolling();
      })
      .catch(() => {
        if (!disposed) startPolling();
      });

    return () => {
      disposed = true;
      stopPolling();
      connection.off('taskCreated');
      connection.off('taskUpdated');
      connection.off('taskStatusChanged');
      connection.off('taskAssigned');
      connection.off('taskDeleted');
      connection.off('taskRestored');
      void connection.stop();
    };
  }, [session?.token, queryClient]);
}
