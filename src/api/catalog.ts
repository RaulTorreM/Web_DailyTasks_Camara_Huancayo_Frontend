import { http, qs } from './client';
import type { DailyTaskArea, DailyTaskUser } from './types';

export const listUsers = (area?: string) =>
  http.get<DailyTaskUser[]>(`/users${qs({ area })}`);

export const listAreas = () => http.get<DailyTaskArea[]>('/areas');
