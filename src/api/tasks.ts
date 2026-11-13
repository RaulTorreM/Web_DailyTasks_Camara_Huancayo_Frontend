import { http, qs } from './client';
import type {
  AssignDailyTaskRequest,
  ChangeDailyTaskStatusRequest,
  CreateDailyTaskRequest,
  DailyTask,
  DailyTaskBoard,
  DailyTaskCalendar,
  DailyTaskCalendarQuery,
  DailyTaskChanges,
  DailyTaskHistoryEntry,
  DailyTaskNotification,
  DailyTaskQuery,
  DailyTaskSettings,
  PagedResult,
  UpdateDailyTaskRequest,
} from './types';

type QueryRecord = Record<string, string | number | boolean | undefined | null>;

const queryString = (query: object) => qs(query as QueryRecord);

export const listTasks = (query: DailyTaskQuery = {}) =>
  http.get<PagedResult<DailyTask>>(`/tasks${queryString(query)}`);

/**
 * Recorre todas las páginas de una consulta. Se usa para las vistas diarias,
 * donde el volumen es pequeño y necesitamos agrupar/filtrar en el cliente.
 */
export async function listAllTasks(query: DailyTaskQuery = {}, maxPages = 20): Promise<DailyTask[]> {
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 100));
  const first = await listTasks({ ...query, page: 1, pageSize });
  const items = [...first.items];
  const pages = Math.min(first.totalPages, maxPages);

  for (let page = 2; page <= pages; page += 1) {
    const next = await listTasks({ ...query, page, pageSize });
    items.push(...next.items);
  }

  return items;
}

export const getTask = (id: number) => http.get<DailyTask>(`/tasks/${id}`);

export const createTask = (payload: CreateDailyTaskRequest) =>
  http.post<DailyTask>('/tasks', payload);

export const updateTask = (id: number, payload: UpdateDailyTaskRequest) =>
  http.put<DailyTask>(`/tasks/${id}`, payload);

export const changeTaskStatus = (id: number, payload: ChangeDailyTaskStatusRequest) =>
  http.patch<DailyTask>(`/tasks/${id}/status`, payload);

export const assignTask = (id: number, payload: AssignDailyTaskRequest) =>
  http.patch<DailyTask>(`/tasks/${id}/assignee`, payload);

export const deleteTask = (id: number) => http.delete<void>(`/tasks/${id}`);

export const restoreTask = (id: number) => http.post<DailyTask>(`/tasks/${id}/restore`);

export const getTaskHistory = (id: number) =>
  http.get<DailyTaskHistoryEntry[]>(`/tasks/${id}/history`);

export const getBoard = (query: DailyTaskQuery = {}) =>
  http.get<DailyTaskBoard>(`/tasks/board${queryString(query)}`);

export const getCalendar = (query: DailyTaskCalendarQuery = {}) =>
  http.get<DailyTaskCalendar>(`/tasks/calendar${queryString(query)}`);

export const getTaskSettings = () => http.get<DailyTaskSettings>('/tasks/settings');

export const updateTaskSettings = (userDueDateWindowDays: number) =>
  http.put<DailyTaskSettings>('/tasks/settings', { userDueDateWindowDays });

export const getNotifications = () =>
  http.get<DailyTaskNotification[]>('/tasks/notifications');

export const markNotificationRead = (id: number) =>
  http.post<void>(`/tasks/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  http.post<void>('/tasks/notifications/read-all');

export const getChanges = (since?: string) =>
  http.get<DailyTaskChanges>(`/tasks/changes${qs({ since })}`);
