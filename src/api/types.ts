export type DailyTaskStatus = 'Pending' | 'InProgress' | 'Done';
export type DailyTaskPriority = 'Low' | 'Medium' | 'High';
export type DailyTaskRole = 'USER' | 'MANAGER';
export type ReportGranularity = 'day' | 'week' | 'month';

export interface DailyTaskUser {
  id: number;
  username: string;
  fullName: string;
  area: string;
  areaName: string;
  role: DailyTaskRole;
}

export interface DailyTaskArea {
  code: string;
  name: string;
}

export interface DailyTask {
  id: number;
  code: string;
  title: string;
  description: string | null;
  status: DailyTaskStatus;
  priority: DailyTaskPriority;
  area: string;
  areaName: string;
  assignedToId: number;
  assignedToName: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
  createdOn: string;
  dueDate: string;
  updatedAt: string;
  completedAt: string | null;
  completedOn: string | null;
  isOverdue: boolean;
  daysOverdue: number;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByName: string | null;
}

export interface DailyTaskCard {
  id: number;
  code: string;
  title: string;
  status: DailyTaskStatus;
  priority: DailyTaskPriority;
  area: string;
  areaName: string;
  assignedToId: number;
  assignedToName: string;
  dueDate: string;
  isOverdue: boolean;
  daysOverdue: number;
}

export interface DailyTaskSettings {
  creationStartTime: string;
  creationEndTime: string;
  allowWeekendCreation: boolean;
  updatedAt: string;
}

export interface UpdateDailyTaskSettingsPayload {
  creationStartTime: string;
  creationEndTime: string;
  allowWeekendCreation: boolean;
}

export interface DailyTaskNotification {
  id: number;
  taskId: number;
  taskTitle: string;
  message: string;
  createdAt: string;
  readAt: string | null;
}

export interface DailyTaskHistoryEntry {
  id: number;
  changedAt: string;
  changedById: number;
  changedByName: string;
  changeGroupId: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DailyTaskBoard {
  pending: DailyTaskCard[];
  inProgress: DailyTaskCard[];
  done: DailyTaskCard[];
}

export interface DailyTaskCalendarDay {
  date: string;
  tasks: DailyTaskCard[];
}

export interface DailyTaskCalendar {
  from: string;
  to: string;
  days: DailyTaskCalendarDay[];
}

export interface DailyTaskChanges {
  tasks: DailyTask[];
  deletedTaskIds: number[];
}

export interface CountByStatus {
  status: DailyTaskStatus;
  count: number;
}

export interface CountByPriority {
  priority: DailyTaskPriority;
  count: number;
}

export interface CountByArea {
  area: string;
  areaName: string;
  count: number;
}

export interface DailyTaskSummary {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  byStatus: CountByStatus[];
  byPriority: CountByPriority[];
  byArea: CountByArea[];
}

export interface DailyTaskReportMetrics {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  createdInPeriod: number;
  completedInPeriod: number;
}

export interface DailyTaskReportSeriesPoint {
  periodStart: string;
  created: number;
  completed: number;
}

export interface DailyTaskReportByUser {
  userId: number;
  fullName: string;
  area: string;
  areaName: string;
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  overdue: number;
  completionRate: number;
  createdInPeriod: number;
  completedInPeriod: number;
}

export interface DailyTaskReportByArea {
  area: string;
  areaName: string;
  total: number;
  done: number;
  overdue: number;
  completionRate: number;
}

export interface DailyTaskReport {
  from: string;
  to: string;
  granularity: ReportGranularity;
  metrics: DailyTaskReportMetrics;
  series: DailyTaskReportSeriesPoint[];
  byUser: DailyTaskReportByUser[];
  byArea: DailyTaskReportByArea[];
  byStatus: CountByStatus[];
  byPriority: CountByPriority[];
}

export interface DailyTaskAuditEntry {
  id: number;
  changedAt: string;
  changedById: number;
  changedByName: string;
  changeGroupId: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  taskId: number;
  taskCode: string;
  taskTitle: string;
  area: string;
  areaName: string;
  assignedToId: number;
  assignedToName: string;
}

export interface DailyTaskAuditQuery {
  from?: string;
  to?: string;
  userId?: number;
  taskId?: number;
  action?: string;
  field?: string;
  q?: string;
  sensitiveOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface LoginResponse {
  token: string;
  user: DailyTaskUser;
}

export interface DailyTaskQuery {
  status?: DailyTaskStatus;
  priority?: DailyTaskPriority;
  assignedToId?: number;
  area?: string;
  createdFrom?: string;
  createdTo?: string;
  dueFrom?: string;
  dueTo?: string;
  dueDate?: string;
  overdue?: boolean;
  teamView?: boolean;
  q?: string;
  updatedSince?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface DailyTaskCalendarQuery extends DailyTaskQuery {
  from?: string;
  to?: string;
  /** Agrupa el calendario por vencimiento (predeterminado) o por fecha de creación. */
  groupBy?: 'dueDate' | 'createdOn';
}

export interface DailyTaskReportQuery {
  from?: string;
  to?: string;
  granularity?: ReportGranularity;
  userId?: number;
  area?: string;
  status?: DailyTaskStatus;
  priority?: DailyTaskPriority;
}

export interface CreateDailyTaskRequest {
  title: string;
  description?: string | null;
  priority?: DailyTaskPriority;
  dueDate?: string;
  assignedToId?: number;
}

export interface UpdateDailyTaskRequest {
  title: string;
  description?: string | null;
  priority?: DailyTaskPriority;
  dueDate?: string;
}

export interface ChangeDailyTaskStatusRequest {
  status: DailyTaskStatus;
}

export interface AssignDailyTaskRequest {
  assignedToId: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
