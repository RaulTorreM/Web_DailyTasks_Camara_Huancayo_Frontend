import { QueryClient } from '@tanstack/react-query';

/**
 * Caché de datos compartida por toda la app.
 *
 * Los datos se consideran frescos durante 60 s; pasado ese tiempo se revalidan
 * en segundo plano sin bloquear la pantalla. En móvil NO se revalida al volver
 * a la app (evita ráfagas).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: { retry: 0 },
  },
});

/** Claves de caché centralizadas: evita errores de tipeo y revalidaciones de más. */
export const qk = {
  me: ['auth', 'me'] as const,
  tasks: (filters: Record<string, unknown> = {}) => ['tasks', filters] as const,
  task: (id: number | string) => ['task', String(id)] as const,
  board: (filters: Record<string, unknown> = {}) => ['board', filters] as const,
  calendar: (from: string, to: string, filters: Record<string, unknown> = {}) =>
    ['calendar', from, to, filters] as const,
  summary: ['summary'] as const,
  reportGlobal: (filters: Record<string, unknown> = {}) => ['report', 'global', filters] as const,
  reportMe: (filters: Record<string, unknown> = {}) => ['report', 'me', filters] as const,
  audit: (filters: Record<string, unknown> = {}) => ['audit', filters] as const,
  history: (id: number | string) => ['history', String(id)] as const,
  users: (area?: string) => ['users', area ?? ''] as const,
  areas: ['areas'] as const,
};

/** Invalida todas las vistas que pueden haberse visto afectadas por un cambio de tarea. */
export function invalidateTaskViews(client: QueryClient, taskId?: number) {
  void client.invalidateQueries({ queryKey: ['tasks'] });
  void client.invalidateQueries({ queryKey: ['board'] });
  void client.invalidateQueries({ queryKey: ['calendar'] });
  void client.invalidateQueries({ queryKey: qk.summary });
  void client.invalidateQueries({ queryKey: ['report'] });
  void client.invalidateQueries({ queryKey: ['audit'] });
  if (taskId != null) {
    void client.invalidateQueries({ queryKey: qk.task(taskId) });
    void client.invalidateQueries({ queryKey: qk.history(taskId) });
  }
}
