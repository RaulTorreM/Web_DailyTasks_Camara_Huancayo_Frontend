import { http, qs } from './client';
import type {
  DailyTaskAuditEntry,
  DailyTaskAuditQuery,
  DailyTaskReport,
  DailyTaskReportQuery,
  DailyTaskSummary,
  PagedResult,
} from './types';

type QueryRecord = Record<string, string | number | boolean | undefined | null>;

const queryString = (query: object) => qs(query as QueryRecord);

export const getSummary = () => http.get<DailyTaskSummary>('/summary');

export const getReport = (query: DailyTaskReportQuery = {}) =>
  http.get<DailyTaskReport>(`/reports${queryString(query)}`);

export const getMyReport = (query: DailyTaskReportQuery = {}) =>
  http.get<DailyTaskReport>(`/reports/me${queryString(query)}`);

export const getAudit = (query: DailyTaskAuditQuery = {}) =>
  http.get<PagedResult<DailyTaskAuditEntry>>(`/audit${queryString(query)}`);
